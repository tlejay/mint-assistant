import { NextResponse } from "next/server";
import { WISHLIST_OPEN } from "@/lib/wishlist-data";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const body = {
    items: WISHLIST_OPEN,
    meta: {
      count: WISHLIST_OPEN.length,
      generated_at: "2026-05-19",
      doc_url: "https://mint-dosx.vercel.app/wishlist",
      log_url: "https://mint-dosx.vercel.app/wishlist/log",
      note:
        WISHLIST_OPEN.length === 0
          ? "Empty — every vendor-side ask has shipped. Shipped history at log_url."
          : `${WISHLIST_OPEN.length} open vendor asks, ranked by ROI. Human-friendly view at doc_url.`,
    },
  };
  // Compact JSON (no whitespace padding) for token efficiency.
  return new NextResponse(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
