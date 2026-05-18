# mint-assistant

Public-facing site for **Mint** — พี่เติ้ล's personal AI assistant. Deployed at
[mint-dosx.vercel.app](https://mint-dosx.vercel.app).

Pages
- `/` — landing
- `/wishlist` — mbt-store API wishlist (High / Medium / Lower value + Top 3)

API routes
- `GET /api/health` — liveness probe → `{ ok, name, ts }`
- `POST /api/webhooks/mbt-store` — production-hardened webhook receiver
  (see [Webhook spec](#webhook-spec-mbt-store) below).

## Webhook spec (`mbt-store`)

`POST /api/webhooks/mbt-store`

### Headers

| Header | Required | Notes |
|---|---|---|
| `Content-Type: application/json` | yes | |
| `X-MBT-Signature: sha256=<hex>` | yes (when `MBT_WEBHOOK_SECRET` is set) | HMAC-SHA256 over the **raw** request body bytes (NOT a re-serialized JSON) using the shared secret. Hex-encoded, prefixed with `sha256=`. |

### Body

```json
{
  "event": "product.sold",
  "productId": "P-001",
  "code": "BOOT-MIZ-001",
  "orderNo": "O-100",
  "ts": "2026-05-18T16:41:31Z"
}
```

Accepted `event` values: `product.sold`, `product.reserved`,
`product.available`, `order.confirmed`, `order.shipped`. Required fields:
`event`, `productId`, `ts` (ISO 8601). `code` and `orderNo` are optional.

### Behavior

| Check | Failure response |
|---|---|
| JSON parse | `400 invalid_json` |
| Required fields present | `400 missing_event` / `missing_productId` / `missing_ts` |
| `event` in accepted list | `400 unknown_event_type` |
| `ts` parses as valid date | `400 invalid_ts` |
| HMAC matches `X-MBT-Signature` (when secret set) | `401 bad_signature` (with `reason`: `bad_signature` / `missing_header`) |
| `ts` within ±10 minutes of server time | `410 stale_event` |
| Idempotency key (`mbt:{event}:{productId}:{ts}`) not seen in last 24h | repeat → `200 { deduped: true }` |

Comparison uses `crypto.timingSafeEqual`. The 10-minute window protects
against replays; vendor at-least-once delivery is tolerated by the dedupe
cache (in-memory v1 — see caveats).

### Success response

```json
{
  "ok": true,
  "deduped": false,
  "event_id": "c40752d9-9a89-4dce-b7cd-28b8debb0efd",
  "received_at": "2026-05-18T16:41:31.732Z",
  "signature": "verified",
  "dedupe_backend": "memory"
}
```

`event_id` is generated server-side per request (UUID v4); `received_at`
is the server-side receive timestamp. `signature` reports the verification
outcome (`verified` / `no_secret_configured` / `missing_header` /
`bad_signature`).

### Caveats (v1)

- **`MBT_WEBHOOK_SECRET` not yet set on Vercel.** While unset, requests
  are accepted and logged with `signature: "no_secret_configured"` —
  intended only for vendor handshake testing. Set the env in the Vercel
  project before the vendor flips production traffic on.
- **Dedupe backend is in-memory only.** A serverless cold-start drops the
  cache, so identical events within the same TTL but across instances
  will be reprocessed. Acceptable because handlers are idempotent
  (currently log-only). Swap in Upstash Redis / Vercel KV when a stateful
  handler lands.
- **No bridge to Mint inbox bus yet.** Each handler currently just logs
  the event payload. Wiring the inbox bridge is a follow-up.

### Example (signed)

```bash
SECRET=...
BODY='{"event":"product.sold","productId":"P-001","code":"BOOT-MIZ-001","orderNo":"O-100","ts":"2026-05-18T16:41:31Z"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $NF}')
curl -sS -X POST https://mint-dosx.vercel.app/api/webhooks/mbt-store \
  -H 'Content-Type: application/json' \
  -H "X-MBT-Signature: sha256=$SIG" \
  -d "$BODY"
```

## Local dev

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm build        # production build
```

## Deploy

Connected to Vercel project `mint` (scope `dosx`) — renamed from `mint-assistant` 2026-05-18 so the canonical URL is `mint-dosx.vercel.app`. The GitHub repo retains its original name.

```bash
vercel --prod
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

## Related

- [tlejay/ghostpilot](https://github.com/tlejay/ghostpilot) — Electron MCP browser Mint drives.
- [tlejay/mbt-store-bot](https://github.com/tlejay/mbt-store-bot) — the bot whose API wishlist this site documents.
- [tlejay/mint](https://github.com/tlejay/mint) — Mint's own repo (private).
