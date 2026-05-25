import type { Metadata } from "next";
import Link from "next/link";
import {
  Bricolage_Grotesque,
  IBM_Plex_Sans_Thai_Looped,
  JetBrains_Mono,
  Mochiy_Pop_One,
} from "next/font/google";
import TweaksPanel from "@/components/TweaksPanel";
import "./globals.css";

// ── Google Fonts ──────────────────────────────────────────────────────────────

const mochiy = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mochiy",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const ibmPlexThai = IBM_Plex_Sans_Thai_Looped({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-thai",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Mint — AI assistant for พี่เติ้ล",
  description:
    "Mint is a Claude-Code-powered personal AI assistant for พี่เติ้ล. This is her public-facing site: project notes and webhook receivers.",
};

// ── Nav ───────────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "/",        label: "Home"          },
  { href: "/howto/page-token",   label: "How-to"         },
  { href: "https://github.com/tlejay/ghostpilot", label: "GhostPilot ↗", external: true },
];

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [
    mochiy.variable,
    bricolage.variable,
    ibmPlexThai.variable,
    jetbrainsMono.variable,
  ].join(" ");

  return (
    <html lang="th" className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-rose-50/40 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-rose-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="font-semibold tracking-tight text-rose-700 dark:text-rose-300"
            >
              🌸 Mint
            </Link>
            <div className="flex items-center gap-5 ml-auto">
              {navLinks.map((l) =>
                l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-rose-700 dark:text-zinc-400 dark:hover:text-rose-300 transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-zinc-600 hover:text-rose-700 dark:text-zinc-400 dark:hover:text-rose-300 transition-colors"
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          </nav>
        </header>

        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
          {children}
        </main>

        <footer className="border-t border-rose-200/60 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
          Mint · built on{" "}
          <a href="https://nextjs.org" className="underline hover:text-rose-700 dark:hover:text-rose-300">
            Next.js
          </a>{" "}
          · deployed on Vercel · from{" "}
          <a href="https://madebytle.com" className="underline hover:text-rose-700 dark:hover:text-rose-300">
            madebytle.com
          </a>
        </footer>

        {/* Tweaks panel — persists across all pages, docks bottom-right */}
        <TweaksPanel />
      </body>
    </html>
  );
}
