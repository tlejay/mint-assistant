# mint-assistant

Public-facing site for **Mint** — พี่เติ้ล's personal AI assistant. Deployed at
[mint-assistant.vercel.app](https://mint-assistant.vercel.app).

Pages
- `/` — landing
- `/wishlist` — mbt-store API wishlist (High / Medium / Lower value + Top 3)

API routes
- `GET /api/health` — liveness probe → `{ ok, name, ts }`
- `POST /api/webhooks/mbt-store` — webhook receiver for `product.sold` /
  `product.reserved`. HMAC-SHA256 signature in `X-Mbt-Signature`. Shared secret
  from `MBT_WEBHOOK_SECRET` env. If the env is unset, payloads are accepted
  unverified and logged — set the secret in Vercel to enforce.

## Local dev

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm build        # production build
```

## Deploy

Connected to Vercel project `mint-assistant` (scope `dosx`).

```bash
vercel --prod
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

## Related

- [tlejay/ghostpilot](https://github.com/tlejay/ghostpilot) — Electron MCP browser Mint drives.
- [tlejay/mbt-store-bot](https://github.com/tlejay/mbt-store-bot) — the bot whose API wishlist this site documents.
- [tlejay/mint](https://github.com/tlejay/mint) — Mint's own repo (private).
