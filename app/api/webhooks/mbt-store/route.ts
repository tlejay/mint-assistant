import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MbtStoreWebhookBody = {
  event: string;
  event_id: string;
  event_ts: string;
  product?: unknown;
  signature?: string;
};

function verifySignature(rawBody: string, headerSig: string | null, secret: string): boolean {
  if (!headerSig) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(headerSig.replace(/^sha256=/, ""), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  let parsed: MbtStoreWebhookBody | null = null;
  try {
    parsed = JSON.parse(raw) as MbtStoreWebhookBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const secret = process.env.MBT_WEBHOOK_SECRET;
  const headerSig =
    req.headers.get("x-mbt-signature") ??
    req.headers.get("x-signature") ??
    null;

  let signatureStatus: "verified" | "unverified" | "no_secret_configured" =
    "unverified";

  if (!secret) {
    signatureStatus = "no_secret_configured";
    console.log(
      "[mbt-store-webhook] no MBT_WEBHOOK_SECRET configured — accepting payload unverified",
    );
  } else {
    const ok = verifySignature(raw, headerSig, secret);
    if (!ok) {
      console.warn("[mbt-store-webhook] signature mismatch — rejecting", {
        event: parsed.event,
        event_id: parsed.event_id,
      });
      return NextResponse.json(
        { ok: false, error: "bad_signature" },
        { status: 401 },
      );
    }
    signatureStatus = "verified";
  }

  console.log("[mbt-store-webhook] received", {
    event: parsed.event,
    event_id: parsed.event_id,
    event_ts: parsed.event_ts,
    product: parsed.product,
    signature_status: signatureStatus,
  });

  return NextResponse.json({
    ok: true,
    received: parsed.event_id,
    signature: signatureStatus,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST mbt-store webhook payloads here. GET is just a heartbeat.",
    },
    { status: 405 },
  );
}
