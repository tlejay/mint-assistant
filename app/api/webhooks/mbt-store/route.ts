import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  type MbtEventType,
  type MbtWebhookBody,
  type SignatureStatus,
  parseAndValidate,
  verifySignature,
  isStale,
  dedupeKey,
  recordAndCheckDuplicate,
} from "@/lib/webhook/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HandlerResult = { ok: true } | { ok: false; error: string };

async function onSold(body: MbtWebhookBody): Promise<HandlerResult> {
  console.log("[mbt-store-webhook] product.sold", {
    productId: body.productId,
    code: body.code,
    orderNo: body.orderNo,
    ts: body.ts,
  });
  return { ok: true };
}

async function onReserved(body: MbtWebhookBody): Promise<HandlerResult> {
  console.log("[mbt-store-webhook] product.reserved", {
    productId: body.productId,
    code: body.code,
    ts: body.ts,
  });
  return { ok: true };
}

async function onAvailable(body: MbtWebhookBody): Promise<HandlerResult> {
  console.log("[mbt-store-webhook] product.available", {
    productId: body.productId,
    code: body.code,
    ts: body.ts,
  });
  return { ok: true };
}

async function onOrderConfirmed(body: MbtWebhookBody): Promise<HandlerResult> {
  console.log("[mbt-store-webhook] order.confirmed", {
    orderNo: body.orderNo,
    productId: body.productId,
    ts: body.ts,
  });
  return { ok: true };
}

async function onOrderShipped(body: MbtWebhookBody): Promise<HandlerResult> {
  console.log("[mbt-store-webhook] order.shipped", {
    orderNo: body.orderNo,
    productId: body.productId,
    ts: body.ts,
  });
  return { ok: true };
}

const handlers: Record<MbtEventType, (b: MbtWebhookBody) => Promise<HandlerResult>> = {
  "product.sold": onSold,
  "product.reserved": onReserved,
  "product.available": onAvailable,
  "order.confirmed": onOrderConfirmed,
  "order.shipped": onOrderShipped,
};

export async function POST(req: NextRequest) {
  const eventId = randomUUID();
  const receivedAt = new Date().toISOString();

  const raw = await req.text();

  const parsed = parseAndValidate(raw);
  if (!parsed.ok) {
    console.warn("[mbt-store-webhook] body rejected", { error: parsed.error });
    const status = parsed.error === "unknown_event_type" ? 400 : 400;
    return NextResponse.json(
      { ok: false, error: parsed.error, event_id: eventId },
      { status },
    );
  }
  const body = parsed.body;

  const secret = process.env.MBT_WEBHOOK_SECRET;
  const headerSig = req.headers.get("x-mbt-signature");
  const sigStatus: SignatureStatus = verifySignature(raw, headerSig, secret);

  if (secret) {
    if (sigStatus !== "verified") {
      console.warn("[mbt-store-webhook] signature rejected", {
        event: body.event,
        productId: body.productId,
        reason: sigStatus,
      });
      return NextResponse.json(
        { ok: false, error: "bad_signature", reason: sigStatus, event_id: eventId },
        { status: 401 },
      );
    }
  } else {
    console.warn(
      "[mbt-store-webhook] MBT_WEBHOOK_SECRET not configured — accepting unverified",
      { event: body.event, productId: body.productId },
    );
  }

  if (isStale(body.ts)) {
    console.warn("[mbt-store-webhook] stale event dropped", {
      event: body.event,
      productId: body.productId,
      ts: body.ts,
    });
    return NextResponse.json(
      { ok: false, error: "stale_event", event_id: eventId },
      { status: 410 },
    );
  }

  const key = dedupeKey(body);
  const dedupe = recordAndCheckDuplicate(key);
  if (dedupe.duplicate) {
    console.log("[mbt-store-webhook] dedupe hit", {
      key,
      backend: dedupe.backend,
    });
    return NextResponse.json({
      ok: true,
      deduped: true,
      event_id: eventId,
      received_at: receivedAt,
      signature: sigStatus,
      dedupe_backend: dedupe.backend,
    });
  }

  const handler = handlers[body.event];
  const result = await handler(body);
  if (!result.ok) {
    console.error("[mbt-store-webhook] handler failed", {
      event: body.event,
      productId: body.productId,
      error: result.error,
    });
    return NextResponse.json(
      { ok: false, error: result.error, event_id: eventId },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    deduped: false,
    event_id: eventId,
    received_at: receivedAt,
    signature: sigStatus,
    dedupe_backend: dedupe.backend,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      hint: "POST mbt-store webhook payloads here with X-MBT-Signature header. GET is just a heartbeat.",
    },
    { status: 405 },
  );
}
