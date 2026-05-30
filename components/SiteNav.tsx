"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Star, Info, Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Schedule", Icon: Calendar },
  { href: "/picks", label: "My Picks", Icon: Star },
  { href: "/about", label: "About", Icon: Info }
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // While the full-screen menu is open, lock background scroll and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-black/5 ${
              isActive(href) ? "bg-black/5 text-sxsw-plum" : ""
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="rounded-full p-2 hover:bg-black/5 sm:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Mobile full-screen menu - portalled to <body> so the header's backdrop-blur
          (which would otherwise become the containing block for this fixed element)
          can't clip it to the header strip. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-sxsw-cream sm:hidden">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight">SXSW</span>
                <span className="text-sm uppercase tracking-[0.2em] text-sxsw-plum">London 2026</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 hover:bg-black/5"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-6">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-2xl font-semibold transition ${
                    isActive(href) ? "text-sxsw-plum" : "text-sxsw-black hover:text-sxsw-plum"
                  }`}
                >
                  <Icon size={28} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
