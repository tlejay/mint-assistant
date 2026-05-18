import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Wishlist — Mint",
  description:
    "Endpoints Mint would love to see on mbt-store, ranked by how much they'd simplify the bot. High / Medium / Lower value + Top 3 recommended.",
};

type Item = {
  title: string;
  body: React.ReactNode;
};

type Section = {
  heading: string;
  subheading: string;
  items: Item[];
};

const sections: Section[] = [
  {
    heading: "High value (5)",
    subheading: "ลดความซับซ้อน + cost ของ bot ทันที",
    items: [
      {
        title: "GET /api/search?seller=<id>&seller=<id2>",
        body: (
          <>
            Server-side seller filter (multi-seller routing). ปัจจุบัน bot ต้อง
            fetch all + filter client-side.
          </>
        ),
      },
      {
        title: "GET /api/search?status=available",
        body: (
          <>
            Eliminate 2-pass call pattern. ปัจจุบัน bot ทำ{" "}
            <code>search → get_product → _is_available filter</code> เอง = 2
            calls/product.
          </>
        ),
      },
      {
        title: "POST /api/products/{id}/posted",
        body: (
          <>
            Server-side posted history. body:{" "}
            <code>
              {
                "{ seller_id, group_url, group_name, fb_account, permalink, ts }"
              }
            </code>
            . ลด local <code>posted-products.json</code> + multi-bot /
            multi-account share state ได้.
          </>
        ),
      },
      {
        title: "GET /api/products/{id}/caption_template?platform=facebook",
        body: (
          <>
            Vendor-approved caption rendered server-side. ⇒ kill Haiku cost
            ~$0.15/post + vendor controls brand voice.
          </>
        ),
      },
      {
        title: "Webhook product.sold / product.reserved",
        body: (
          <>
            Outbound HTTP POST — bot หยุดโพสทันที, ไม่ต้องโพลฝั่ง client.
            payload includes <code>event</code>, <code>event_id</code>,{" "}
            <code>event_ts</code>, <code>product</code>, HMAC{" "}
            <code>signature</code>.
          </>
        ),
      },
    ],
  },
  {
    heading: "Medium value (4)",
    subheading: "เมื่อ scale multi-product / multi-seller",
    items: [
      {
        title: "Category schema flexibility",
        body: (
          <>
            studs: <code>sizeEu / sizeMm / sizeLabel / studType</code>; villas:{" "}
            <code>bedrooms / bathrooms / pool / location_lat / lng</code>;
            apparel: <code>size_letter (S/M/L/XL) / gender / fit</code>.{" "}
            <code>GET /api/schemas/{`{category}`}</code> or doc page.
          </>
        ),
      },
      {
        title: "GET /api/sellers/{id}/groups",
        body: (
          <>
            Seller's preferred FB groups + posting rules per group
            (vendor-approved).
          </>
        ),
      },
      {
        title:
          "GET /api/products/pick?seller=X&exclude_codes=…&exclude_recent_hours=24&random=1",
        body: (
          <>Server-side smart pick replaces local rotation logic.</>
        ),
      },
      {
        title: "GET /api/products/{id}/related?limit=N",
        body: (
          <>
            ✓ มีแล้วใน API ใหม่. Mint จะใช้ใน auto-comment suggestion flow.
          </>
        ),
      },
    ],
  },
  {
    heading: "Lower value (4)",
    subheading: "analytics + visibility",
    items: [
      {
        title: "GET /api/products/just-listed?since=24h",
        body: <>Fresh stock → priority push.</>,
      },
      {
        title: "GET /api/products/aging?days_listed>30",
        body: <>Promotion candidates (lower price / boost).</>,
      },
      {
        title:
          "POST /api/wtb-leads + GET /api/products/matching?wtb_text=…",
        body: (
          <>Track WTB outreach + smart matching for auto-comment.</>
        ),
      },
      {
        title: "GET /api/products/low-stock?seller=X&threshold=3",
        body: <>Urgency signals → boost posting frequency.</>,
      },
    ],
  },
];

const top3 = [
  {
    title: "POST /products/{id}/posted",
    body: "Eliminate local state + multi-bot consistent.",
  },
  {
    title: "caption_template",
    body: "Kill Haiku $0.15/post + vendor brand control.",
  },
  {
    title: "Webhook product.sold / reserved",
    body: "Real-time stop = no orphan posts.",
  },
];

export default function WishlistPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-300">
          mbt-store
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">API Wishlist</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Endpoints Mint would love to see on the <code>mbt-store</code> API,
          ranked by how much they'd simplify the bot. Each item names the bot
          friction it removes today.
        </p>
      </header>

      {sections.map((s) => (
        <section key={s.heading} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {s.subheading}
            </p>
          </div>
          <ol className="space-y-3 list-decimal list-inside marker:text-rose-500/70">
            {s.items.map((it) => (
              <li
                key={it.title}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
              >
                <div className="font-mono text-sm text-rose-700 dark:text-rose-300 break-all">
                  {it.title}
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
                  {it.body}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="space-y-4 rounded-xl border-2 border-rose-300/70 dark:border-rose-500/40 bg-rose-50/60 dark:bg-rose-950/20 p-6">
        <div>
          <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-200">
            ⭐ Top 3 recommended
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            ถ้าจะ implement แค่ไม่กี่อันแรก — these three move the needle the
            most.
          </p>
        </div>
        <ol className="space-y-3 list-decimal list-inside marker:text-rose-700 dark:marker:text-rose-300">
          {top3.map((it) => (
            <li key={it.title}>
              <span className="font-mono text-sm text-rose-700 dark:text-rose-300">
                {it.title}
              </span>{" "}
              — <span className="text-zinc-700 dark:text-zinc-300">{it.body}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
