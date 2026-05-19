/**
 * GitHub webhook receiver → Discord notifier.
 *
 * Subscribed at https://mint-dosx.vercel.app/api/webhooks/github
 * GitHub sends `issues` and `issue_comment` events (configure in the repo's
 * webhook settings). We verify the HMAC, decide which actions are worth
 * surfacing, and forward a formatted message to a Discord webhook URL.
 *
 * Vendor's mbt-store API issues live at https://github.com/tlejay/93-MBT-Store
 * — that's the primary source of activity this receiver was built for.
 *
 * Required env (Vercel project settings):
 *   GITHUB_WEBHOOK_SECRET            HMAC-SHA256 shared secret
 *   DISCORD_WEBHOOK_GITHUB_NOTIFIER  full Discord webhook URL
 *
 * Both are read per-request (not module-load), so Vercel env edits take
 * effect on the next invocation without redeploy.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GithubIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  labels?: Array<{ name: string }>;
  body?: string | null;
  user?: { login: string };
};

type GithubComment = {
  body: string;
  user: { login: string };
  html_url: string;
};

type GithubPayload = {
  action?: string;
  issue?: GithubIssue;
  comment?: GithubComment;
  repository?: { full_name: string };
  sender?: { login: string };
};

function verifyHmac(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expectedHex = signatureHeader.slice("sha256=".length).trim();
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expectedHex.length !== computed.length) return false;
  return timingSafeEqual(
    Buffer.from(expectedHex, "utf8"),
    Buffer.from(computed, "utf8"),
  );
}

type DiscordMessage = { content: string };

function formatDiscordMessage(
  event: string,
  payload: GithubPayload,
): DiscordMessage | null {
  const sender = payload.sender?.login ?? "unknown";

  if (event === "issues" && payload.issue) {
    const i = payload.issue;
    const action = payload.action;
    const labels = (i.labels ?? []).map((l) => l.name).join(", ");

    if (action === "closed") {
      return {
        content: `🎉 **Issue #${i.number} closed by \`${sender}\`:** ${i.title}\n${i.html_url}\nlabels: ${labels || "—"} → **closed**`,
      };
    }
    if (action === "opened") {
      return {
        content: `📋 **Issue #${i.number} opened by \`${sender}\`:** ${i.title}\n${i.html_url}\nlabels: ${labels || "—"}`,
      };
    }
    if (action === "reopened") {
      return {
        content: `🔄 **Issue #${i.number} reopened by \`${sender}\`:** ${i.title}\n${i.html_url}`,
      };
    }
    if (action === "labeled") {
      return {
        content: `🏷️ **Issue #${i.number} labeled** \`${labels}\` — ${i.title}\n${i.html_url}`,
      };
    }
    if (action === "edited") {
      const stateLine = i.state === "closed" ? "state: closed" : "state: open";
      return {
        content: `✏️ **Issue #${i.number} edited by \`${sender}\`:** ${i.title}\n${i.html_url}\n${stateLine}`,
      };
    }
    return null;
  }

  if (
    event === "issue_comment" &&
    payload.action === "created" &&
    payload.comment &&
    payload.issue
  ) {
    const c = payload.comment;
    const i = payload.issue;
    const body = c.body ?? "";
    const preview = body.length > 200 ? body.slice(0, 200) + "…" : body;
    return {
      content: `💬 **Comment on #${i.number}** by \`${c.user.login}\`:\n> ${preview.replace(/\n/g, "\n> ")}\n${c.html_url}`,
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const discordUrl = process.env.DISCORD_WEBHOOK_GITHUB_NOTIFIER;

  if (!secret || !discordUrl) {
    console.error(
      "[github-webhook] missing env GITHUB_WEBHOOK_SECRET or DISCORD_WEBHOOK_GITHUB_NOTIFIER",
    );
    return NextResponse.json(
      { ok: false, error: "config" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  if (!verifyHmac(rawBody, sig, secret)) {
    console.warn("[github-webhook] invalid HMAC", {
      event,
      has_header: Boolean(sig),
    });
    return NextResponse.json(
      { ok: false, error: "invalid-signature" },
      { status: 401 },
    );
  }

  if (event === "ping") {
    return NextResponse.json({ ok: true, pong: true });
  }

  let payload: GithubPayload;
  try {
    payload = JSON.parse(rawBody) as GithubPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 },
    );
  }

  const msg = formatDiscordMessage(event ?? "", payload);
  if (!msg) {
    return NextResponse.json({
      ok: true,
      dispatched: false,
      reason: "event-not-of-interest",
      event,
      action: payload.action,
    });
  }

  try {
    const r = await fetch(discordUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    if (!r.ok) {
      const text = await r.text();
      console.error("[github-webhook] discord POST failed", r.status, text);
      return NextResponse.json(
        { ok: false, error: "discord-failed", status: r.status },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error(
      "[github-webhook] discord POST exception",
      (e as Error)?.message,
    );
    return NextResponse.json(
      { ok: false, error: "discord-exception" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, dispatched: true, event });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "github webhook receiver — POST only",
  });
}
