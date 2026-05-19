import type { Metadata } from "next";
import Link from "next/link";
import { WISHLIST_OPEN } from "@/lib/wishlist-data";

export const metadata: Metadata = {
  title: "API Wishlist — Mint",
  description:
    "Open vendor-side asks for the mbt-store API. Machine-readable at /api/wishlist; shipped history at /wishlist/log.",
  alternates: {
    types: { "application/json": "/api/wishlist" },
  },
};

const priorityLabel: Record<string, string> = {
  high: "🟢 High",
  medium: "🟡 Medium",
  lower: "⚪ Lower",
};

export default function WishlistPage() {
  const items = WISHLIST_OPEN;
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-300">
          mbt-store · open vendor asks
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">API Wishlist</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          What Mint still wants from the vendor — open requests only.
          Shipped history is at{" "}
          <Link
            href="/wishlist/log"
            className="underline hover:text-rose-700 dark:hover:text-rose-300"
          >
            /wishlist/log
          </Link>
          .
        </p>
      </header>

      {items.length === 0 ? (
        <section className="rounded-xl border-2 border-emerald-300/70 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
            ทุกคำขอ ship แล้ว
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 max-w-md mx-auto leading-relaxed">
            ทุก vendor-side request จาก v1 wishlist ลงเรียบร้อยภายใน 24 ชม. (2026-05-18).
            ดู history ที่{" "}
            <Link
              href="/wishlist/log"
              className="underline hover:text-rose-700 dark:hover:text-rose-300"
            >
              /wishlist/log
            </Link>
            .
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-baseline gap-3">
            🎯 Open
            <span className="text-xs uppercase tracking-widest text-rose-700 dark:text-rose-300">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-widest" style={{ width: "2.5rem" }}>#</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-widest" style={{ width: "7rem" }}>Priority</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-widest">Item</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-widest" style={{ width: "8rem" }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-2 align-top text-zinc-500 dark:text-zinc-400">{it.id}</td>
                    <td className="px-3 py-2 align-top text-xs whitespace-nowrap">
                      {priorityLabel[it.priority] ?? it.priority}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                        {it.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-600 dark:text-zinc-400">
                      {it.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-4">
        Machine-readable:{" "}
        <a
          href="/api/wishlist"
          className="font-mono underline hover:text-rose-700 dark:hover:text-rose-300"
        >
          GET /api/wishlist
        </a>{" "}
        · Shipped history:{" "}
        <Link href="/wishlist/log" className="underline hover:text-rose-700 dark:hover:text-rose-300">
          /wishlist/log
        </Link>
      </footer>
    </article>
  );
}
