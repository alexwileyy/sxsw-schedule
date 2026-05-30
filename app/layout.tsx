import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SXSW London 2026 - Alex's Schedule",
  description: "Personalised schedule visualiser for SXSW London 2026, tuned for Gocertify's technical track."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sxsw-cream text-sxsw-black antialiased">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-sxsw-cream/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight">SXSW</span>
              <span className="text-sm uppercase tracking-[0.2em] text-sxsw-plum">London 2026</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link className="rounded-full px-3 py-1.5 hover:bg-black/5" href="/">Schedule</Link>
              <Link className="rounded-full px-3 py-1.5 hover:bg-black/5" href="/picks">My Picks</Link>
              <Link className="rounded-full px-3 py-1.5 hover:bg-black/5" href="/about">About</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
        <footer className="border-t border-black/10 bg-sxsw-cream py-6 text-center text-xs text-black/50">
          Built for Alex @ Gocertify · Recommendations tuned to the For Techies track
        </footer>
      </body>
    </html>
  );
}
