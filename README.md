# mint-assistant

Public-facing site for **Mint** — พี่เติ้ล's personal AI assistant. Deployed at
[mint-dosx.vercel.app](https://mint-dosx.vercel.app).

Pages
- `/` — landing
- `/wishlist` — mbt-store API wishlist (High / Medium / Lower value + Top 3)
- `/warroom` — PIN-gated editor for Mint's runtime config (see [Warroom](#warroom) below)

API routes
- `GET /api/health` — liveness probe → `{ ok, name, ts }`
- `POST /api/webhooks/mbt-store` — production-hardened webhook receiver
  (see [Webhook spec](#webhook-spec-mbt-store) below).
- `GET/PATCH /api/config` — list / update `config_entries` rows. Soft-gated
  by the `X-Warroom-Pin` header (same PIN as the lock screen).

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

## Warroom

`/warroom` is a soft-locked control panel for Mint's runtime config —
sell-post knobs, scheduler enable/disable toggles, persona rules, GhostPilot
mode, the LINE watch list, etc.

Soft lock: client-side numpad takes the PIN **`1235`**, stores
`mint_warroom_unlocked: <epoch-ms>` in `localStorage` (24h TTL), and
unlocks the config view. The API behind it (`/api/config`) checks the same
PIN via the `X-Warroom-Pin` header. Treat this as a cosmetic gate — anyone
who knows the PIN can read + edit every config row. Not a substitute for
real auth.

Mint does **not** read config in realtime — พี่เติ้ล tells Mint to sync
explicitly (e.g. "ดึง config ใหม่"), at which point Mint hits
`GET /api/config` and applies the changes locally.

### Schema

```sql
CREATE TABLE config_entries (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  label       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  TEXT
);
```

19 keys seeded in 5 categories: `sell-post` (8) · `scheduler` (5) ·
`persona` (3) · `ghostpilot` (2) · `line` (1). See
`db/migrations/001_init.sql` for the full seed.

### Migrations

```bash
DATABASE_URL=$DATABASE_URL pnpm exec tsx db/run-migrations.ts
```

Each `db/migrations/*.sql` file is executed in lexicographic order. The
runner splits on `;` (sufficient for migrations under our control) and runs
each statement via Neon's HTTP driver (which doesn't accept multi-statement
queries). All seed inserts use `ON CONFLICT (key) DO NOTHING` so re-running
is safe and additive.

### Required env

- `DATABASE_URL` — Neon Postgres pooler DSN. Set via
  `vercel env add DATABASE_URL production` (and `development`). Never
  committed; never echoed to logs or chat. Pull locally with
  `vercel env pull .env.local`.

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
