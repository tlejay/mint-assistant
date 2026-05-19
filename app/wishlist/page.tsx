import type { Metadata } from "next";
import Link from "next/link";
import {
  WISHLIST_OPEN,
  type OpenItem,
  type OpenPriority,
} from "@/lib/wishlist-data";

export const metadata: Metadata = {
  title: "API Wishlist — Mint",
  description:
    "Open vendor-side asks for the mbt-store API. Machine-readable at /api/wishlist; shipped history at /wishlist/log.",
  alternates: {
    types: { "application/json": "/api/wishlist" },
  },
};

const priorityStyle: Record<
  OpenPriority,
  { label: string; chip: string; accent: string }
> = {
  "hard-blocker": {
    label: "🔴 Hard blocker",
    chip:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border-rose-300/70 dark:border-rose-700/50",
    accent: "border-rose-300 dark:border-rose-700",
  },
  regression: {
    label: "🟠 Regression",
    chip:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-orange-300/70 dark:border-orange-700/50",
    accent: "border-orange-300 dark:border-orange-700",
  },
  "data-gap": {
    label: "🟡 Data gap",
    chip:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300/70 dark:border-amber-700/50",
    accent: "border-amber-300 dark:border-amber-700",
  },
  "token-saver": {
    label: "🟢 Token saver",
    chip:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-300/70 dark:border-emerald-700/50",
    accent: "border-emerald-300 dark:border-emerald-700",
  },
  future: {
    label: "🔵 Future",
    chip:
      "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 border-sky-300/70 dark:border-sky-700/50",
    accent: "border-sky-300 dark:border-sky-700",
  },
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
          Vendor team — these are ranked by ROI to Mint&apos;s process. Each
          card is paste-ready: click and drag to select, or use the{" "}
          <span className="inline-block font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
            Copy as text
          </span>{" "}
          block at the bottom of each item. Shipped history is at{" "}
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
        <section className="space-y-5">
          {items.map((it, idx) => (
            <AskCard key={it.id} item={it} index={idx + 1} />
          ))}
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
        <Link
          href="/wishlist/log"
          className="underline hover:text-rose-700 dark:hover:text-rose-300"
        >
          /wishlist/log
        </Link>
      </footer>
    </article>
  );
}

function AskCard({ item, index }: { item: OpenItem; index: number }) {
  const style = priorityStyle[item.priority];
  const copyText = renderCopyText(item, index);
  return (
    <article
      className={`rounded-xl border-2 ${style.accent} bg-white dark:bg-zinc-950 p-5 space-y-3`}
    >
      <header className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          #{index}
        </span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {item.title}
        </h2>
        <span
          className={`text-[10px] uppercase tracking-widest font-medium border rounded px-1.5 py-0.5 ${style.chip}`}
        >
          {style.label}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {item.category}
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
          {item.id}
        </span>
      </header>

      <Field label="Ask" body={item.ask} />
      <Field label="Why" body={item.why} />
      <Field label="Current workaround" body={item.current_workaround} />
      <Field label="Token / cost impact" body={item.token_impact} />

      {item.spec && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
            Spec
          </div>
          <pre className="text-[12px] font-mono whitespace-pre-wrap break-words bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 overflow-x-auto select-all">
            {item.spec}
          </pre>
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-rose-700 dark:hover:text-rose-300 select-none">
          📋 Copy as text (click to expand)
        </summary>
        <pre className="mt-2 text-[12px] font-mono whitespace-pre-wrap break-words bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 select-all">
          {copyText}
        </pre>
      </details>
    </article>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-0.5">
        {label}
      </div>
      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function renderCopyText(item: OpenItem, index: number): string {
  const parts: string[] = [
    `#${index} ${item.title}  [${item.priority} · ${item.category}]`,
    ``,
    `Ask: ${item.ask}`,
    `Why: ${item.why}`,
    `Current workaround: ${item.current_workaround}`,
    `Token / cost impact: ${item.token_impact}`,
  ];
  if (item.spec) {
    parts.push("", "Spec:", item.spec);
  }
  return parts.join("\n");
}
