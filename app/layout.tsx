import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mint.madebytle.com"),
  title: "Mint — AI assistant for พี่เติ้ล",
  description:
    "Mint is a Claude-Code-powered personal AI assistant. Mintira Womm, AI สาวตัวมัมแห่งวงการ Womm จาก madebytle.com.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://mint.madebytle.com",
    title: "Mint — AI assistant for พี่เติ้ล",
    description:
      "AI สาวตัวมัมแห่งวงการ Womm (Works On My Machine 🙄) จาก madebytle.com",
    siteName: "Mint AI Assistant",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mint AI Assistant — Mintira Womm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mint — AI assistant for พี่เติ้ล",
    description:
      "AI สาวตัวมัมแห่งวงการ Womm จาก madebytle.com",
    images: ["/og-image.png"],
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/howto/page-token", label: "How-to" },
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
      lang="th"
      className={`${notoThai.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-rose-50/40 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-rose-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur sticky top-0 z-10">
          <nav
            className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-6 text-sm"
            aria-label="Primary"
          >
            <Link
              href="/"
              className="font-semibold tracking-tight text-rose-700 dark:text-rose-300"
              aria-label="Mint home"
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
                    className="text-zinc-700 hover:text-rose-700 dark:text-zinc-300 dark:hover:text-rose-300 transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-zinc-700 hover:text-rose-700 dark:text-zinc-300 dark:hover:text-rose-300 transition-colors"
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
        <footer className="border-t border-rose-200/60 dark:border-zinc-800 py-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
          A Nonsense project from{" "}
          <a
            href="https://madebytle.com"
            className="underline hover:text-rose-700 dark:hover:text-rose-300"
          >
            MadeByTle.com
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
