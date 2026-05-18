import type { Metadata } from "next";
import { WISHLIST } from "@/app/api/wishlist/route";

export const metadata: Metadata = {
  title: "API Wishlist — Mint",
  description:
    "v1 shipped 2026-05-18 (13 + 5 bonus). v2 roadmap (11 items). Machine-readable at /api/wishlist.",
  alternates: {
    types: { "application/json": "/api/wishlist" },
  },
};

const categoryLabel: Record<string, string> = {
  high: "High",
  medium: "Medium",
  lower: "Lower",
  bonus: "Bonus",
};

const priorityLabel: Record<string, string> = {
  high: "🟢 High",
  medium: "🟡 Medium",
  lower: "⚪ Lower",
  strategic: "🔵 Strategic",
};

const cell = "px-3 py-2 align-top border-b border-zinc-200 dark:border-zinc-800";
const th = `${cell} text-left font-medium text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-widest`;

export default function WishlistPage() {
  const allShipped = [...WISHLIST.shipped, ...WISHLIST.shipped_bonus];
  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-300">
          mbt-store · v1 shipped, v2 open
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">API Wishlist</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Vendor shipped every v1 item plus 5 bonus features within 24 hours
          (2026-05-18). v2 is the next stack of integration work on top of the
          new surface.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-baseline gap-3">
          ✅ Shipped (v1)
          <span className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            13 + 5 bonus
          </span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className={th} style={{ width: "6rem" }}>Category</th>
                <th className={th}>Endpoint / Item</th>
                <th className={th} style={{ width: "5rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allShipped.map((it, i) => (
                <tr key={i} className="bg-white dark:bg-zinc-950">
                  <td className={cell}>
                    <span className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {categoryLabel[it.category] ?? it.category}
                    </span>
                  </td>
                  <td className={cell}>
                    <div className="font-mono text-[13px] text-zinc-900 dark:text-zinc-100 break-all">
                      {it.endpoint}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                      {it.description}
                    </div>
                  </td>
                  <td className={cell}>
                    <span className="text-emerald-700 dark:text-emerald-300">✅</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-baseline gap-3">
          🎯 What&apos;s Next (v2)
          <span className="text-xs uppercase tracking-widest text-rose-700 dark:text-rose-300">
            11 open
          </span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className={th} style={{ width: "2.5rem" }}>#</th>
                <th className={th} style={{ width: "7rem" }}>Priority</th>
                <th className={th}>Item</th>
                <th className={th} style={{ width: "5rem" }}>Effort</th>
                <th className={th} style={{ width: "12rem" }}>Depends on</th>
              </tr>
            </thead>
            <tbody>
              {WISHLIST.next.map((it) => (
                <tr key={it.id} className="bg-white dark:bg-zinc-950">
                  <td className={`${cell} text-zinc-500 dark:text-zinc-400`}>{it.id}</td>
                  <td className={`${cell} text-xs whitespace-nowrap`}>
                    {priorityLabel[it.priority] ?? it.priority}
                  </td>
                  <td className={cell}>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {it.title}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                      {it.description}
                    </div>
                  </td>
                  <td className={`${cell} text-xs whitespace-nowrap text-zinc-700 dark:text-zinc-300`}>
                    {it.effort_hours == null ? "—" : `${it.effort_hours}h`}
                  </td>
                  <td className={`${cell} text-xs text-zinc-600 dark:text-zinc-400`}>
                    {it.depends_on ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Machine-readable:{" "}
        <a
          href="/api/wishlist"
          className="font-mono underline hover:text-rose-700 dark:hover:text-rose-300"
        >
          GET /api/wishlist
        </a>{" "}
        · same data, JSON. Page last updated {WISHLIST.updated_at}.
      </footer>
    </article>
  );
}
