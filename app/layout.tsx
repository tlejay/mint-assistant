import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mint — AI assistant for พี่เติ้ล",
  description:
    "Mint is a Claude-Code-powered personal AI assistant for พี่เติ้ล. This is her public-facing site: API wishlist, project notes, and webhook receivers.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/wishlist", label: "API Wishlist" },
  { href: "/warroom", label: "Warroom" },
  {
    href: "https://github.com/tlejay/ghostpilot",
    label: "GhostPilot ↗",
    external: true,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
          <a
            href="https://nextjs.org"
            className="underline hover:text-rose-700 dark:hover:text-rose-300"
          >
            Next.js
          </a>{" "}
          · deployed on Vercel · from{" "}
          <a
            href="https://madebytle.com"
            className="underline hover:text-rose-700 dark:hover:text-rose-300"
          >
            madebytle.com
          </a>
        </footer>
      </body>
    </html>
  );
}
