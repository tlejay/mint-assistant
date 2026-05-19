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
          ? "Empty — every vendor-side ask from the v1 wishlist has shipped. Shipped history at log_url."
          : "Open vendor-side asks. Shipped history (not returned by this endpoint) at log_url.",
    },
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
