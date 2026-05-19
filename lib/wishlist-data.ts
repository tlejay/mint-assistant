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

export type OpenItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "lower";
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
 * Currently empty: every vendor-side ask from the v1 wishlist shipped 2026-05-18,
 * and the v2 list documented in commit 4f31581 was — on re-read — entirely Mint's
 * own integration work (webhook→inbox bridge, brand auto-tag, size-collage reply,
 * per-seller analytics, Warroom config sync, etc.). Those don't belong on a vendor-
 * facing wishlist; they're tracked in Mint's own TODO.md.
 *
 * Add an entry here only when there's a genuinely new vendor endpoint / behavior
 * we want shipped.
 */
export const WISHLIST_OPEN: OpenItem[] = [];

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
