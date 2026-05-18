import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

type ShippedItem = {
  category: "high" | "medium" | "lower" | "bonus";
  endpoint: string;
  description: string;
};

type NextItem = {
  id: number;
  priority: "high" | "medium" | "lower" | "strategic";
  title: string;
  description: string;
  effort_hours: number | null;
  depends_on: string | null;
};

const shipped: ShippedItem[] = [
  // high (5)
  {
    category: "high",
    endpoint: "GET /api/search?seller=<id>",
    description:
      "Multi-seller filter (status=available also included as bonus on the same endpoint).",
  },
  {
    category: "high",
    endpoint: "GET /api/search?status=available",
    description: "Server-side availability filter — kills the 2-pass pattern.",
  },
  {
    category: "high",
    endpoint: "POST /api/products/{id}/posted",
    description: "Vendor-tracked posting history (paired GET endpoint shipped too).",
  },
  {
    category: "high",
    endpoint: "GET /api/products/{id}/caption_template?platform=facebook",
    description: "Server-rendered captions — kills the Haiku-per-post LLM bill (~$0.15/post).",
  },
  {
    category: "high",
    endpoint: "Webhook: product.sold / product.reserved",
    description:
      "Outbound HTTP with HMAC-SHA256 in X-MBT-Signature. mint-assistant receiver is live + hardened.",
  },
  // medium (4)
  {
    category: "medium",
    endpoint: "category=studs|villas|apparel",
    description: "Schema flexibility per category — paves the way for multi-product expansion.",
  },
  {
    category: "medium",
    endpoint: "GET /api/sellers/{id}/groups",
    description:
      "Vendor manages FB groups per seller server-side (replaces local monitor-state.json fallback).",
  },
  {
    category: "medium",
    endpoint:
      "GET /api/products/pick?exclude_codes=&exclude_recent_hours=&random=1",
    description: "Server-side smart rotation — bot stops doing client-side shuffles.",
  },
  {
    category: "medium",
    endpoint: "GET /api/products/{id}/related?limit=N",
    description: "Related-products endpoint — unlocks suggestion flows in auto-comment.",
  },
  // lower (4)
  {
    category: "lower",
    endpoint: "GET /api/products/just-listed?since=24",
    description: "Fresh-stock priority push — surfaces inventory just added.",
  },
  {
    category: "lower",
    endpoint: "GET /api/products/aging?days=30",
    description: "Promotion candidates — items sitting in stock past a threshold.",
  },
  {
    category: "lower",
    endpoint:
      "POST /api/wtb-leads + GET /api/products/matching?wtb_text=...",
    description: "WTB lead capture + smart matching from free-form text.",
  },
  {
    category: "lower",
    endpoint: "GET /api/products/low-stock?threshold=3",
    description: "Urgency signals — codes about to run out.",
  },
];

const shippedBonus: ShippedItem[] = [
  {
    category: "bonus",
    endpoint:
      "POST /api/webhooks | GET /api/webhooks | DELETE /api/webhooks/{id}",
    description: "Full webhook subscription management API.",
  },
  {
    category: "bonus",
    endpoint: "GET /api/sellers (now includes facebookUrl)",
    description: "Previously just {id, name} — now exposes the seller's FB URL too.",
  },
  {
    category: "bonus",
    endpoint:
      "Webhook events: product.available, order.confirmed, order.shipped",
    description: "Beyond sold/reserved — covers un-reserve and the post-purchase pipeline.",
  },
  {
    category: "bonus",
    endpoint: "GET /api/brands",
    description: "Brand metadata — enables brand-aware captions / tagging.",
  },
  {
    category: "bonus",
    endpoint: "GET /api/size-collage (incl. JPEG binary endpoint)",
    description:
      "Size-grouped collage with an image endpoint — drop-in for FB comment replies.",
  },
];

const next: NextItem[] = [
  {
    id: 1,
    priority: "high",
    title: "Webhook → Mint inbox bridge",
    description:
      "When vendor fires product.sold / product.reserved, mint-assistant's receiver writes a structured note to Mint's local inbox (data/inboxes/mint.json) so Mint surfaces it in Discord in real time. Today the receiver only logs.",
    effort_hours: 2,
    depends_on: null,
  },
  {
    id: 2,
    priority: "high",
    title: "Multi-seller routing in sell-post",
    description:
      "Bot still falls back to monitor-state.json for groups because /api/sellers/1/groups returns empty. Once vendor populates seller groups, the bot should source the FB group list from the API as source of truth (with seller-specific rules per group).",
    effort_hours: 1,
    depends_on: "vendor populates seller groups",
  },
  {
    id: 3,
    priority: "high",
    title: "Realtime ขายแล้ว Discord notification",
    description:
      "Webhook receiver pushes a Discord message to a stock-cut channel mirror when product.sold fires. Trivial once the inbox bridge is in place.",
    effort_hours: 0.5,
    depends_on: "inbox bridge (#1)",
  },
  {
    id: 4,
    priority: "medium",
    title: "Auto-comment related-product suggestion",
    description:
      "When auto-comment matches a WTB post, also pull related products via /api/products/{id}/related and tack on a soft suggestion (\"…also have similar in size 42 / size 43\").",
    effort_hours: 2,
    depends_on: null,
  },
  {
    id: 5,
    priority: "medium",
    title: "Size-collage reply",
    description:
      "When an FB comment asks \"มีไซส์อะไรบ้าง?\", auto-comment replies with the /api/size-collage/{slug}/image JPEG instead of a text list.",
    effort_hours: 2,
    depends_on: null,
  },
  {
    id: 6,
    priority: "medium",
    title: "Brand auto-tag in caption",
    description:
      "Pull brand metadata from /api/brands and append a #NikeMercurial-style tag at the end of Haiku-rendered captions.",
    effort_hours: 1,
    depends_on: null,
  },
  {
    id: 7,
    priority: "lower",
    title: "Per-seller analytics",
    description:
      "Daily digest in Discord showing per-seller posts / runs / failures.",
    effort_hours: 3,
    depends_on: null,
  },
  {
    id: 8,
    priority: "lower",
    title: "/api/products/aging → daily promotion ping",
    description:
      "Mint scheduler pulls aging products each morning and pings พี่เติ้ล: \"หนูแอบเสนอ STD-xxx, อยู่ในสต็อกมา 45 วันแล้ว ลด 200 บาทเพิ่มแรงดึงดูดมั้ยพี่?\"",
    effort_hours: 1,
    depends_on: null,
  },
  {
    id: 9,
    priority: "lower",
    title: "WTB lead capture in auto-comment",
    description:
      "When an FB WTB post has no matching product, auto-create a lead via POST /api/wtb-leads so vendor can follow up later.",
    effort_hours: 1.5,
    depends_on: null,
  },
  {
    id: 10,
    priority: "strategic",
    title: "Mint config sync from Warroom",
    description:
      "When พี่เติ้ล edits a config row at /warroom, optionally trigger the Mint pane via Discord channel/webhook to pick up the new value (vs the current pattern of waiting for พี่ to message Mint manually).",
    effort_hours: 3,
    depends_on: null,
  },
  {
    id: 11,
    priority: "strategic",
    title: "Multi-product expansion",
    description:
      "Once vendor adds villas / apparel products, generalize sell-post into per-category posters (separate pipelines, shared infra).",
    effort_hours: null,
    depends_on: "category schema settles",
  },
];

export const WISHLIST = {
  version: 2,
  updated_at: "2026-05-19",
  notes:
    "Mint's wishlist for the mbt-store API. v1 shipped 2026-05-18 in full (13 items + 5 bonus). v2 is next.",
  shipped,
  shipped_bonus: shippedBonus,
  next,
};

export async function GET() {
  return NextResponse.json(WISHLIST, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
