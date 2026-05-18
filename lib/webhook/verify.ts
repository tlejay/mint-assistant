import { createHmac, timingSafeEqual } from "node:crypto";

export const REPLAY_WINDOW_MS = 10 * 60 * 1000;
export const DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;

export const MBT_EVENT_TYPES = [
  "product.sold",
  "product.reserved",
  "product.available",
  "order.confirmed",
  "order.shipped",
] as const;

export type MbtEventType = (typeof MBT_EVENT_TYPES)[number];

export type MbtWebhookBody = {
  event: MbtEventType;
  productId: string;
  code?: string;
  orderNo?: string;
  ts: string;
};

export type ParseResult =
  | { ok: true; body: MbtWebhookBody }
  | { ok: false; error: string };

export function parseAndValidate(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "body_not_object" };
  }
  const obj = parsed as Record<string, unknown>;

  if (typeof obj.event !== "string") {
    return { ok: false, error: "missing_event" };
  }
  if (!(MBT_EVENT_TYPES as readonly string[]).includes(obj.event)) {
    return { ok: false, error: "unknown_event_type" };
  }
  if (typeof obj.productId !== "string" || obj.productId.length === 0) {
    return { ok: false, error: "missing_productId" };
  }
  if (typeof obj.ts !== "string" || obj.ts.length === 0) {
    return { ok: false, error: "missing_ts" };
  }
  if (Number.isNaN(Date.parse(obj.ts))) {
    return { ok: false, error: "invalid_ts" };
  }
  if (obj.code !== undefined && typeof obj.code !== "string") {
    return { ok: false, error: "invalid_code" };
  }
  if (obj.orderNo !== undefined && typeof obj.orderNo !== "string") {
    return { ok: false, error: "invalid_orderNo" };
  }

  return {
    ok: true,
    body: {
      event: obj.event as MbtEventType,
      productId: obj.productId,
      code: obj.code as string | undefined,
      orderNo: obj.orderNo as string | undefined,
      ts: obj.ts,
    },
  };
}

export type SignatureStatus =
  | "verified"
  | "no_secret_configured"
  | "missing_header"
  | "bad_signature";

export function verifySignature(
  rawBody: string,
  headerSig: string | null | undefined,
  secret: string | undefined,
): SignatureStatus {
  if (!secret) return "no_secret_configured";
  if (!headerSig) return "missing_header";

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = headerSig.replace(/^sha256=/i, "").trim();

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return "bad_signature";
  return timingSafeEqual(a, b) ? "verified" : "bad_signature";
}

export function isStale(ts: string, now: number = Date.now()): boolean {
  const eventTime = Date.parse(ts);
  if (Number.isNaN(eventTime)) return true;
  return Math.abs(now - eventTime) > REPLAY_WINDOW_MS;
}

export function dedupeKey(body: MbtWebhookBody): string {
  return `mbt:${body.event}:${body.productId}:${body.ts}`;
}

type DedupeEntry = { firstSeen: number };

const memoryCache = new Map<string, DedupeEntry>();

function sweep(now: number) {
  for (const [k, v] of memoryCache) {
    if (now - v.firstSeen > DEDUPE_TTL_MS) memoryCache.delete(k);
  }
}

export type DedupeResult = {
  duplicate: boolean;
  backend: "memory" | "none";
};

export function recordAndCheckDuplicate(key: string): DedupeResult {
  const now = Date.now();
  if (memoryCache.size > 500) sweep(now);
  const existing = memoryCache.get(key);
  if (existing) {
    return { duplicate: true, backend: "memory" };
  }
  memoryCache.set(key, { firstSeen: now });
  return { duplicate: false, backend: "memory" };
}
