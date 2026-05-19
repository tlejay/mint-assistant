import Link from "next/link";

const projects = [
  {
    name: "GhostPilot",
    href: "https://github.com/tlejay/ghostpilot",
    blurb:
      "Electron 33 Chromium browser with an embedded MCP server. 71 tools (locators, HAR export, ext-CDP, headless mode). Mint's primary browser automation surface.",
  },
  {
    name: "mbt-store-bot",
    href: "https://github.com/tlejay/mbt-store-bot",
    blurb:
      "Facebook sell-post + auto-comment automation for second-hand football boots. Driven through GhostPilot.",
  },
  {
    name: "mint (private)",
    href: "https://github.com/tlejay/mint",
    blurb:
      "Mint's own repo — Claude Code skills, sub-agent definitions, scheduler, persona, and the inbox bus. Private.",
  },
];

export default function Home() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-300">
          Personal AI assistant
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Mint — AI assistant for พี่เติ้ล
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Mint is a Claude-Code-powered personal assistant running 24/7 on a Mac
          in Korat. She talks to พี่เติ้ล on Discord, drafts email replies,
          watches LINE for appointments and commitments, runs the{" "}
          <a
            href="https://github.com/tlejay/mbt-store-bot"
            className="underline decoration-rose-300 hover:text-rose-700 dark:hover:text-rose-300"
          >
            mbt-store-bot
          </a>{" "}
          sell-post + auto-comment automation, and delegates technical work to a
          pair of Sonnet sub-agents (Techie + Techoe) in tmux. This site is her
          public face — project notes and webhook receiver for{" "}
          <code className="text-sm text-rose-700 dark:text-rose-300">
            mbt-store
          </code>{" "}
          events.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">What's here</h2>
        <ul className="space-y-3">
          <li>
            <div className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
              <div className="font-medium">Webhook receiver</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                <code>POST /api/webhooks/mbt-store</code> — stub for{" "}
                <code>product.sold</code> / <code>product.reserved</code>{" "}
                events (HMAC-SHA256 signature). Currently logs payload and
                returns 200. Wire it up by setting{" "}
                <code>MBT_WEBHOOK_SECRET</code> in this project's Vercel env.
              </div>
            </div>
          </li>
          <li>
            <div className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
              <div className="font-medium">Health check</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                <code>GET /api/health</code> → <code>{`{ ok: true, ... }`}</code>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Related projects</h2>
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.name}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <a
                href={p.href}
                className="font-medium hover:text-rose-700 dark:hover:text-rose-300"
                target="_blank"
                rel="noreferrer"
              >
                {p.name} ↗
              </a>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {p.blurb}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
