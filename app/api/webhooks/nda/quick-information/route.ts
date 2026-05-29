/**
 * NDA Quick-Information webhook receiver -> Discord Rich Embed notifier.
 *
 * Subscribed at https://mint.madebytle.com/api/webhooks/nda/quick-information
 * NDA Website (koratdigital.com) POSTs here when someone submits the
 * Quick-Information form. Mint validates Bearer auth, formats a Rich Embed,
 * and posts to Discord channel 1502170023500972102 (NDA Official #notify).
 *
 * Required env (Vercel project settings):
 *   NDA_WEBHOOK_SECRET   Shared bearer token (sent via Authorization header)
 *   DISCORD_BOT_TOKEN    Same Mint bot token used for other Discord calls
 *
 * Owner mention IDs (hard-coded — these are project-specific):
 *   Tle:  884711658843426856
 *   Mark: 1183728145740857398
 *
 * Closes issue tlejay/mint#56.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_CHANNEL_ID = "1502170023500972102"; // NDA Official #notify
const GUILD_ID = "1497838236905504788"; // NDA Official guild
const MENTION_TLE = "884711658843426856";
const MENTION_MARK = "1183728145740857398";

type NdaPayload = {
  event?: string;
  submission_type?: "individual" | "corporate" | string;
  name_th?: string;
  surname_th?: string;
  name_en?: string | null;
  org_name?: string | null;
  email?: string;
  slug?: string;
  profile_image_url?: string | null;
  db_action?: "created" | "updated" | string;
  timestamp?: string;
};

function buildEmbed(p: NdaPayload) {
  const isCorporate = p.submission_type === "corporate";
  const isUpdated = p.db_action === "updated";
  const color = isUpdated ? 0xf97316 : 0x22c55e; // orange : green

  const titleSuffix = isCorporate ? "องค์กร" : "บุคคล";
  const actionWord = isUpdated ? "อัปเดต" : "สมาชิกใหม่";
  const title = `Quick Information . ${actionWord} (${titleSuffix})`;

  const lines: string[] = [];
  if (p.org_name) lines.push(`**ชื่อองค์กร:** ${p.org_name}`);
  if (p.name_th || p.surname_th)
    lines.push(`**ชื่อ (ไทย):** ${[p.name_th, p.surname_th].filter(Boolean).join(" ")}`);
  if (p.name_en) lines.push(`**ชื่อ (EN):** ${p.name_en}`);
  if (p.email) lines.push(`**อีเมล:** ${p.email}`);
  if (p.slug) lines.push(`**Slug:** \`${p.slug}\``);
  lines.push(`**โลโก้/รูป:** ${p.profile_image_url ? "อัปโหลดแล้ว ✓" : "ไม่มี"}`);
  lines.push(`**DB:** ${isUpdated ? "อัปเดต ✓" : "สร้างใหม่ ✓"}`);

  const embed: Record<string, unknown> = {
    title,
    description: lines.join("\n"),
    color,
    footer: { text: "koratdigital.com . Quick Information" },
    timestamp: p.timestamp || new Date().toISOString(),
  };
  if (p.profile_image_url) {
    embed.image = { url: p.profile_image_url };
  }
  return embed;
}

export async function POST(req: NextRequest) {
  const secret = process.env.NDA_WEBHOOK_SECRET;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!secret || !botToken) {
    console.error(
      "[nda-webhook] missing env NDA_WEBHOOK_SECRET or DISCORD_BOT_TOKEN",
    );
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const expectedAuth = `Bearer ${secret}`;
  if (authHeader !== expectedAuth) {
    console.warn("[nda-webhook] invalid auth", {
      hasHeader: Boolean(authHeader),
    });
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let payload: NdaPayload;
  try {
    payload = (await req.json()) as NdaPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 },
    );
  }

  // Build Discord message
  const mention = `<@${MENTION_TLE}> <@${MENTION_MARK}>`;
  const body = {
    content: mention,
    embeds: [buildEmbed(payload)],
    allowed_mentions: { users: [MENTION_TLE, MENTION_MARK] },
  };

  try {
    const r = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!r.ok) {
      const text = await r.text();
      console.error("[nda-webhook] discord POST failed", r.status, text);
      return NextResponse.json(
        { ok: false, error: "discord-failed", status: r.status, detail: text },
        { status: 502 },
      );
    }
    const sent = await r.json();
    return NextResponse.json({
      ok: true,
      dispatched: true,
      message_id: sent.id,
      channel_id: DISCORD_CHANNEL_ID,
      guild_id: GUILD_ID,
    });
  } catch (e) {
    console.error(
      "[nda-webhook] discord POST exception",
      (e as Error)?.message,
    );
    return NextResponse.json(
      { ok: false, error: "discord-exception" },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "NDA Quick-Information webhook receiver . POST only",
    docs: "https://github.com/tlejay/mint/issues/56",
  });
}
