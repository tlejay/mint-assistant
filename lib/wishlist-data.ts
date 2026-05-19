/**
 * Wishlist data — single source of truth split across two surfaces:
 *
 *   /wishlist + /api/wishlist  →  WISHLIST_OPEN  (vendor-facing, token-efficient)
 *   /wishlist/log              →  WISHLIST_LOG   (human browse, full shipped history)
 *
 * Token-efficiency note: WISHLIST_OPEN is what vendor LLMs scrape. Keep it minimal —
 * empty array when every ask has shipped. The shipped backlog lives in WISHLIST_LOG
 * and is never returned by the API.
 */

export type OpenPriority =
  | "hard-blocker"
  | "regression"
  | "data-gap"
  | "token-saver"
  | "future";

export type OpenCategory =
  | "webhooks"
  | "products"
  | "sellers"
  | "caption"
  | "collage"
  | "comments";

export type OpenItem = {
  id: string;
  title: string;
  ask: string;
  why: string;
  current_workaround: string;
  token_impact: string;
  priority: OpenPriority;
  category: OpenCategory;
  spec?: string;
};

export type LogItem = {
  title: string;
  endpoint: string;
  description: string;
  category:
    | "search"
    | "products"
    | "sellers"
    | "caption"
    | "webhooks"
    | "wtb"
    | "brands"
    | "schema"
    | "collage";
  tier: "core" | "bonus";
  delivered_at: string; // ISO date
  delivered_version?: string;
};

/* ────────────────────────── OPEN (vendor-facing) ────────────────────────── */
/*
 * Five vendor asks, ranked by ROI to Mint's day-to-day pipeline. Order is
 * intentional — vendor LLM can read top-to-bottom and ship in that order.
 */
export const WISHLIST_OPEN: OpenItem[] = [
  {
    id: "webhook-secret",
    title: "MBT_WEBHOOK_SECRET (HMAC-SHA256 signing key)",
    priority: "hard-blocker",
    category: "webhooks",
    ask: "ส่ง MBT_WEBHOOK_SECRET ให้ Mint vault keychain + register receiver URL https://mint-dosx.vercel.app/api/webhooks/mbt-store ผ่าน POST /api/webhooks (admin).",
    why: "ยังไม่มี secret → Mint verify HMAC payload ไม่ได้ → Tier 3 receiver offline. Mint ปัจจุบันต้อง poll /api/products เป็นรอบๆ เพื่อ detect sold/reserved/listed.",
    current_workaround: "poll /api/products ~50 calls/day × 18 products.",
    token_impact:
      "Before: ~$0.50/day Mint LLM polling overhead. After: event-driven, 0 polls, realtime <5s latency.",
    spec: `POST /api/webhooks (admin)
Body: {
  url: "https://mint-dosx.vercel.app/api/webhooks/mbt-store",
  events: ["product.sold", "product.reserved", "product.listed"],
  secret: <returned>
}`,
  },
  {
    id: "pick-500-regression",
    title: "/api/products/pick HTTP 500 regression",
    priority: "regression",
    category: "products",
    ask: "แก้ /api/products/pick และ /api/products/pick?random=true ที่คืน HTTP 500 ตั้งแต่ v1.14.0-build023.",
    why: "Bot รัน Tier 1 fallback ไป legacy search+shuffle ได้อยู่ แต่ extra round-trip + duplicate filtering ต้องทำเอง.",
    current_workaround:
      "try /pick → if 500 → fallback to /api/products?category=studs&status=available&seller=1 + client-side shuffle + exclude_recent_hours filter.",
    token_impact:
      "Before: 2 round-trips + client filtering. After: 1 call, server filters.",
    spec: `curl -sS https://mbt-store.vercel.app/api/products/pick \\
  -H "Authorization: Bearer $MBT_API_TOKEN" -v
# Expect 200 with one product, exclude_recent_hours=24 + random=true honored`,
  },
  {
    id: "seller-groups-populate-1",
    title: "populate /api/sellers/1/groups data",
    priority: "data-gap",
    category: "sellers",
    ask: 'vendor populate seller_groups data ของ seller_id=1 ("เบิร์ด"). ปัจจุบัน list_seller_groups(1) → [] (empty).',
    why: "Bot ใช้ /sellers/{id}/groups เป็น single source of truth สำหรับ posting routing. ตอนนี้ตก fallback ไป local data/monitor-state.json → ต้อง redeploy บอทเมื่อแก้ group list.",
    current_workaround:
      "monitor-state.json local 5 groups priority=high. มิ้นพร้อมส่ง JSON ให้ vendor import ผ่าน admin.",
    token_impact:
      "Process-saver, not token-saver. Future config edits don't require Mint redeploy.",
    spec: `Expected shape:
{
  groups: [
    {
      groupName: "...",
      groupUrl: "https://facebook.com/...",
      rules: { priority: "high", sell_post: true }
    }
  ]
}`,
  },
  {
    id: "caption-brand-hashtag",
    title: "caption_template auto-inject #brand hashtag",
    priority: "token-saver",
    category: "caption",
    ask: "เพิ่ม #brand hashtag ที่ท้ายบรรทัด 1 ของ /api/products/{id}/caption_template?platform=facebook.",
    why: "ตอนนี้ Mint ต้อง call /api/brands แยกเพื่อหา hashtag แล้ว concat client-side. ถ้า vendor inject ใน template → drop 1 round-trip + drop Mint token.",
    current_workaround: "list_brands() lookup + string concat.",
    token_impact:
      "Before: 1 extra /api/brands round-trip + 50+ tokens client concat per post. After: 0 extra calls.",
    spec: `Before: "Nike Tiempo Legend 10 Elite FG FR44/JP280\\n2,390 ฿ สภาพดี ไม่มีตำหนิ"
After:  "Nike Tiempo Legend 10 Elite FG FR44/JP280 #Nike\\n2,390 ฿ สภาพดี ไม่มีตำหนิ"
Edge: brand="adidas" → "#adidas" (lowercase preserved as-is from /api/brands).`,
  },
  {
    id: "product-size-collage-url",
    title: "include size_collage_url in /api/products and /api/products/pick response",
    priority: "token-saver",
    category: "collage",
    ask: "เพิ่ม field size_collage_url ใน product response — cached URL ของ collage ที่ vendor compose ไว้แล้ว.",
    why: "ตอนนี้ Mint ต้อง call /api/size-collage แยก + compose collage ฝั่ง client. ถ้า vendor cache URL ใน product response → drop 1 call + drop compose step.",
    current_workaround:
      "GET /api/size-collage → compose composite client-side via PIL/canvas.",
    token_impact:
      "Before: 18 extra /api/size-collage round-trips/day + image compose CPU. After: 0 extra calls, vendor CDN serves cached PNG.",
    spec: `GET /api/products/STD-094
Response:
{
  "code": "STD-094",
  "images": [...],
  "size_collage_url": "https://cdn.mbt-store.com/collage/STD-094-FR40.png",
  ...
}`,
  },
];

/* ─────────────────────── LOG (shipped vendor history) ───────────────────── */

export const WISHLIST_LOG: LogItem[] = [
  // ── v1 core wishlist — shipped 2026-05-18 ────────────────────────────────
  {
    title: "Multi-seller search filter",
    endpoint: "GET /api/search?seller=<id>",
    description:
      "Multi-seller filter (status=available was also folded into the same endpoint as a bonus).",
    category: "search",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.12.0-build021",
  },
  {
    title: "Server-side availability filter",
    endpoint: "GET /api/search?status=available",
    description: "Kills the bot's 2-pass search → get_product → _is_available pattern.",
    category: "search",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.12.0-build021",
  },
  {
    title: "Posting-history audit",
    endpoint: "POST /api/products/{id}/posted",
    description: "Vendor-tracked posting history (paired GET endpoint shipped too).",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.12.0-build021",
  },
  {
    title: "Server-rendered caption template",
    endpoint: "GET /api/products/{id}/caption_template?platform=facebook",
    description:
      "Kills the Haiku-per-post LLM bill (~$0.15/post). v1.14.1 added a 2-line format with conditionShort() logic.",
    category: "caption",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x → v1.14.1-build024",
  },
  {
    title: "product.sold / product.reserved webhooks",
    endpoint: "Webhook → POST <subscriber>",
    description:
      "Outbound HTTP with HMAC-SHA256 in X-MBT-Signature. mint-assistant receiver is live + hardened.",
    category: "webhooks",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Per-category product schema",
    endpoint: "?category=studs|villas|apparel",
    description: "Schema flexibility per category — paves the way for multi-product expansion.",
    category: "schema",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Seller-managed FB groups",
    endpoint: "GET /api/sellers/{id}/groups",
    description:
      "Vendor manages FB groups per seller server-side (replaces local monitor-state.json fallback).",
    category: "sellers",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Server-side smart rotation",
    endpoint:
      "GET /api/products/pick?exclude_codes=&exclude_recent_hours=&random=1",
    description: "Bot stops doing client-side shuffles; vendor picks within the eligible pool.",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.12.0-build021",
  },
  {
    title: "Related-products lookup",
    endpoint: "GET /api/products/{id}/related?limit=N",
    description: "Unlocks suggestion flows in auto-comment (e.g. 'also have size 42 / 43').",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Just-listed feed",
    endpoint: "GET /api/products/just-listed?since=24",
    description: "Fresh-stock priority push — surfaces inventory just added.",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Aging feed",
    endpoint: "GET /api/products/aging?days=30",
    description: "Promotion candidates — items sitting in stock past a threshold.",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "WTB lead capture + smart matching",
    endpoint:
      "POST /api/wtb-leads + GET /api/products/matching?wtb_text=...",
    description: "Lead capture + ranked match-from-free-text from a single field.",
    category: "wtb",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Low-stock signal",
    endpoint: "GET /api/products/low-stock?threshold=3",
    description: "Urgency signals — codes about to run out.",
    category: "products",
    tier: "core",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },

  // ── bonus features the vendor shipped beyond the ask ─────────────────────
  {
    title: "Webhook subscription management",
    endpoint:
      "POST /api/webhooks · GET /api/webhooks · DELETE /api/webhooks/{id}",
    description: "Full webhook subscription management API.",
    category: "webhooks",
    tier: "bonus",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Seller `facebookUrl` field",
    endpoint: "GET /api/sellers (now includes facebookUrl)",
    description: "Previously just {id, name} — now exposes the seller's FB URL too.",
    category: "sellers",
    tier: "bonus",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Order-lifecycle webhook events",
    endpoint:
      "Webhook events: product.available, order.confirmed, order.shipped",
    description: "Beyond sold/reserved — covers un-reserve and the post-purchase pipeline.",
    category: "webhooks",
    tier: "bonus",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Brand metadata endpoint",
    endpoint: "GET /api/brands",
    description:
      "Brand metadata — enables brand-aware captions / tagging. Today returns ASICS, Mizuno, Nike, PUMA, adidas.",
    category: "brands",
    tier: "bonus",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
  {
    title: "Size-grouped collage",
    endpoint: "GET /api/size-collage (incl. JPEG binary endpoint)",
    description:
      "Size-grouped collage with an image endpoint — drop-in for FB comment replies.",
    category: "collage",
    tier: "bonus",
    delivered_at: "2026-05-18",
    delivered_version: "v1.13.x",
  },
];
