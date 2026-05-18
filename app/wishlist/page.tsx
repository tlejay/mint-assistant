import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Wishlist — Mint",
  description:
    "v1 wishlist shipped 2026-05-18 (13 items + 5 bonus features) — and the v2 roadmap of what Mint wants next.",
};

type ShippedItem = {
  endpoint: string;
  blurb: string;
};

type ShippedGroup = {
  heading: string;
  badge: string;
  items: ShippedItem[];
};

const shippedGroups: ShippedGroup[] = [
  {
    heading: "High value (5/5)",
    badge: "✅",
    items: [
      {
        endpoint: "GET /api/search?seller=<id>",
        blurb:
          "Multi-seller filter. (status=available also included as bonus on the same endpoint.)",
      },
      {
        endpoint: "GET /api/search?status=available",
        blurb: "Server-side availability filter — kills the 2-pass pattern.",
      },
      {
        endpoint: "POST /api/products/{id}/posted",
        blurb:
          "Vendor-tracked posting history (paired GET endpoint shipped too).",
      },
      {
        endpoint: "GET /api/products/{id}/caption_template?platform=facebook",
        blurb:
          "Server-rendered captions — kills the Haiku-per-post LLM bill (~$0.15/post).",
      },
      {
        endpoint: "Webhook: product.sold / product.reserved",
        blurb:
          "Outbound HTTP with HMAC-SHA256 in X-MBT-Signature. mint-assistant receiver is live + hardened.",
      },
    ],
  },
  {
    heading: "Medium value (4/4)",
    badge: "✅",
    items: [
      {
        endpoint: "category=studs|villas|apparel",
        blurb:
          "Schema flexibility per category — paves the way for multi-product expansion.",
      },
      {
        endpoint: "GET /api/sellers/{id}/groups",
        blurb:
          "Vendor manages FB groups per seller server-side (replaces local monitor-state.json fallback).",
      },
      {
        endpoint: "GET /api/products/pick?exclude_codes=&exclude_recent_hours=&random=1",
        blurb: "Server-side smart rotation — bot stops doing client-side shuffles.",
      },
      {
        endpoint: "GET /api/products/{id}/related?limit=N",
        blurb: "Related-products endpoint — unlocks suggestion flows in auto-comment.",
      },
    ],
  },
  {
    heading: "Lower value (4/4)",
    badge: "✅",
    items: [
      {
        endpoint: "GET /api/products/just-listed?since=24",
        blurb: "Fresh-stock priority push — surfaces inventory just added.",
      },
      {
        endpoint: "GET /api/products/aging?days=30",
        blurb: "Promotion candidates — items sitting in stock past a threshold.",
      },
      {
        endpoint: "POST /api/wtb-leads + GET /api/products/matching?wtb_text=…",
        blurb: "WTB lead capture + smart matching from free-form text.",
      },
      {
        endpoint: "GET /api/products/low-stock?threshold=3",
        blurb: "Urgency signals — codes about to run out.",
      },
    ],
  },
  {
    heading: "🆕 Bonus (vendor added beyond wishlist)",
    badge: "🎁",
    items: [
      {
        endpoint:
          "POST /api/webhooks · GET /api/webhooks · DELETE /api/webhooks/{id}",
        blurb: "Full webhook subscription management API.",
      },
      {
        endpoint: "GET /api/sellers (now includes facebookUrl)",
        blurb:
          "Previously just {id, name} — now exposes the seller's FB URL too.",
      },
      {
        endpoint:
          "Webhook events: product.available · order.confirmed · order.shipped",
        blurb:
          "Beyond sold/reserved — covers un-reserve and the post-purchase pipeline.",
      },
      {
        endpoint: "GET /api/brands",
        blurb: "Brand metadata — enables brand-aware captions / tagging.",
      },
      {
        endpoint: "GET /api/size-collage (incl. JPEG binary endpoint)",
        blurb:
          "Size-grouped collage with an image endpoint — drop-in for FB comment replies.",
      },
    ],
  },
];

type Priority = "high" | "medium" | "lower" | "strategic";

type NextItem = {
  title: string;
  blurb: string;
  effort: string;
  dependsOn?: string;
};

type NextGroup = {
  heading: string;
  priority: Priority;
  items: NextItem[];
};

const priorityStyles: Record<Priority, { swatch: string; accent: string; label: string }> = {
  high: {
    swatch: "bg-emerald-500",
    accent: "text-emerald-700 dark:text-emerald-300",
    label: "High",
  },
  medium: {
    swatch: "bg-amber-500",
    accent: "text-amber-700 dark:text-amber-300",
    label: "Medium",
  },
  lower: {
    swatch: "bg-zinc-400 dark:bg-zinc-500",
    accent: "text-zinc-700 dark:text-zinc-300",
    label: "Lower",
  },
  strategic: {
    swatch: "bg-sky-500",
    accent: "text-sky-700 dark:text-sky-300",
    label: "Strategic",
  },
};

const nextGroups: NextGroup[] = [
  {
    heading: "🟢 High value (do soon)",
    priority: "high",
    items: [
      {
        title: "Webhook → Mint inbox bridge",
        blurb:
          "When vendor fires product.sold / product.reserved, mint-assistant's receiver writes a structured note to Mint's local inbox (data/inboxes/mint.json) so Mint surfaces it in Discord in real time. Today the receiver only logs.",
        effort: "~2 hr",
      },
      {
        title: "Multi-seller routing in sell-post",
        blurb:
          "Bot still falls back to monitor-state.json for groups because /api/sellers/1/groups returns empty. Once vendor populates seller groups, the bot should source the FB group list from the API as source of truth (with seller-specific rules per group).",
        effort: "~1 hr bot work",
        dependsOn: "vendor populates seller groups",
      },
      {
        title: 'Realtime "ขายแล้ว" Discord notification',
        blurb:
          "Webhook receiver pushes a Discord message to a stock-cut channel mirror when product.sold fires. Trivial once the inbox bridge is in place.",
        effort: "~30 min",
        dependsOn: "inbox bridge",
      },
    ],
  },
  {
    heading: "🟡 Medium",
    priority: "medium",
    items: [
      {
        title: "Auto-comment related-product suggestion",
        blurb:
          'When auto-comment matches a WTB post, also pull related products via /api/products/{id}/related and tack on a soft suggestion ("…also have similar in size 42 / size 43").',
        effort: "~2 hr",
      },
      {
        title: "Size-collage reply",
        blurb:
          'When an FB comment asks "มีไซส์อะไรบ้าง?", auto-comment replies with the /api/size-collage/{slug}/image JPEG instead of a text list.',
        effort: "~2 hr",
      },
      {
        title: "Brand auto-tag in caption",
        blurb:
          "Pull brand metadata from /api/brands and append a #NikeMercurial-style tag at the end of Haiku-rendered captions.",
        effort: "~1 hr",
      },
    ],
  },
  {
    heading: "⚪ Lower value (nice-to-have)",
    priority: "lower",
    items: [
      {
        title: "Per-seller analytics",
        blurb:
          "Daily digest in Discord showing per-seller posts / runs / failures.",
        effort: "~3 hr",
      },
      {
        title: "/api/products/aging → daily promotion ping",
        blurb:
          'Mint scheduler pulls aging products each morning and pings พี่เติ้ล: "หนูแอบเสนอ STD-xxx, อยู่ในสต็อกมา 45 วันแล้ว ลด 200 บาทเพิ่มแรงดึงดูดมั้ยพี่?"',
        effort: "~1 hr",
      },
      {
        title: "WTB lead capture in auto-comment",
        blurb:
          "When an FB WTB post has no matching product, auto-create a lead via POST /api/wtb-leads so vendor can follow up later.",
        effort: "~1.5 hr",
      },
    ],
  },
  {
    heading: "🔵 Strategic (long-term, depends on usage)",
    priority: "strategic",
    items: [
      {
        title: "Mint config sync from Warroom",
        blurb:
          "When พี่เติ้ล edits a config row at /warroom, optionally trigger the Mint pane via Discord channel/webhook to pick up the new value (vs the current pattern of waiting for พี่ to message Mint manually).",
        effort: "~3 hr",
      },
      {
        title: "Multi-product expansion",
        blurb:
          "Once vendor adds villas / apparel products, generalize sell-post into per-category posters (separate pipelines, shared infra).",
        effort: "1+ days",
        dependsOn: "category schema settles",
      },
    ],
  },
];

export default function WishlistPage() {
  return (
    <article className="space-y-12">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-300">
          mbt-store · v1 → v2
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">API Wishlist</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A live snapshot of what Mint is asking from the mbt-store API. v1 went
          from "ask" to "shipped in production" within 24 hours. v2 is the next
          set — mostly integration work on top of the new surface.
        </p>
      </header>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span>✅ Shipped (v1)</span>
            <span className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-medium">
              vendor 2026-05-18
            </span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every request from the v1 wishlist landed in production within 24
            hours. Recognition + thanks. Below: v1 items with their status —{" "}
            <strong>13 wishlist items + 5 bonus features</strong>.
          </p>
        </div>

        <div className="space-y-6">
          {shippedGroups.map((g) => (
            <div key={g.heading} className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                {g.badge} {g.heading}
              </h3>
              <ul className="space-y-3">
                {g.items.map((it) => (
                  <li
                    key={it.endpoint}
                    className="rounded-lg border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4"
                  >
                    <div className="font-mono text-sm text-emerald-800 dark:text-emerald-200 break-all">
                      {it.endpoint}
                    </div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                      {it.blurb}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t-2 border-rose-200/60 dark:border-zinc-800" />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span>🎯 What&apos;s Next (v2)</span>
            <span className="text-xs uppercase tracking-widest text-rose-700 dark:text-rose-300 font-medium">
              open requests
            </span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Now that v1 is live, here&apos;s what Mint wants next. Each builds on
            top of the v1 surface — most are integration / composition work, not
            new endpoints.
          </p>
        </div>

        <div className="space-y-8">
          {nextGroups.map((g) => {
            const style = priorityStyles[g.priority];
            return (
              <div key={g.heading} className="space-y-3">
                <h3 className={`text-sm font-medium uppercase tracking-widest ${style.accent}`}>
                  {g.heading}
                </h3>
                <ul className="space-y-3">
                  {g.items.map((it) => (
                    <li
                      key={it.title}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${style.swatch}`}
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{it.title}</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                            {it.blurb}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>
                              <strong className="text-zinc-700 dark:text-zinc-300">
                                Effort:
                              </strong>{" "}
                              {it.effort}
                            </span>
                            {it.dependsOn && (
                              <span>
                                <strong className="text-zinc-700 dark:text-zinc-300">
                                  Depends on:
                                </strong>{" "}
                                {it.dependsOn}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Page last updated 2026-05-19. v1 history kept in repo history; see{" "}
        <a
          href="https://github.com/tlejay/mint-assistant"
          className="underline hover:text-rose-700 dark:hover:text-rose-300"
        >
          tlejay/mint-assistant
        </a>{" "}
        for the source of this page.
      </footer>
    </article>
  );
}
