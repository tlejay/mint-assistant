import type { Metadata } from "next";
import Link from "next/link";
import { WISHLIST_LOG, type LogItem } from "@/lib/wishlist-data";

export const metadata: Metadata = {
  title: "Wishlist Log — Mint",
  description:
    "Vendor-shipped features from the mbt-store API wishlist, grouped by category.",
  robots: { index: false, follow: false },
};

const categoryLabel: Record<LogItem["category"], string> = {
  search: "🔍 Search",
  products: "📦 Products",
  sellers: "🧑‍💼 Sellers",
  caption: "📝 Caption",
  webhooks: "🪝 Webhooks",
  wtb: "🛍️ WTB",
  brands: "🏷️ Brands",
  schema: "🧬 Schema",
  collage: "🖼️ Collage",
};

const categoryOrder: LogItem["category"][] = [
  "caption",
  "search",
  "products",
  "sellers",
  "webhooks",
  "wtb",
  "brands",
  "schema",
  "collage",
];

function groupByCategory(items: LogItem[]) {
  const map = new Map<LogItem["category"], LogItem[]>();
  for (const it of items) {
    const arr = map.get(it.category) ?? [];
    arr.push(it);
    map.set(it.category, arr);
  }
  // sort each group by delivered_at desc
  for (const arr of map.values()) {
    arr.sort((a, b) => b.delivered_at.localeCompare(a.delivered_at));
  }
  return categoryOrder
    .filter((c) => map.has(c))
    .map((c) => [c, map.get(c)!] as const);
}

export default function WishlistLogPage() {
  const grouped = groupByCategory(WISHLIST_LOG);
  const coreCount = WISHLIST_LOG.filter((it) => it.tier === "core").length;
  const bonusCount = WISHLIST_LOG.filter((it) => it.tier === "bonus").length;
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          shipped history
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          ✨ Wishlist Log
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          พี่เติ้ลส่วนตัว — vendor LLM ไม่อ่าน. {WISHLIST_LOG.length} feature
          shipped รวม ({coreCount} จาก wishlist + {bonusCount} bonus จาก vendor).
          กลับไปที่{" "}
          <Link
            href="/wishlist"
            className="underline hover:text-rose-700 dark:hover:text-rose-300"
          >
            /wishlist
          </Link>{" "}
          (open asks).
        </p>
      </header>

      {grouped.map(([cat, items]) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            {categoryLabel[cat]}{" "}
            <span className="text-zinc-500 dark:text-zinc-400 normal-case font-normal">
              · {items.length}
            </span>
          </h2>
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.title}
                className="rounded-lg border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4"
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {it.title}
                  </span>
                  {it.tier === "bonus" && (
                    <span className="text-[10px] uppercase tracking-widest font-medium text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 rounded px-1.5 py-0.5">
                      bonus
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {it.delivered_at}
                    {it.delivered_version ? ` · ${it.delivered_version}` : ""}
                  </span>
                </div>
                <div className="font-mono text-[12px] text-emerald-800 dark:text-emerald-200 mt-1 break-all">
                  {it.endpoint}
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                  {it.description}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-4">
        ← <Link href="/wishlist" className="underline hover:text-rose-700 dark:hover:text-rose-300">/wishlist</Link>{" "}
        (open requests for vendor LLM)
      </footer>
    </article>
  );
}
