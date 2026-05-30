"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Star, Info, Menu, X, LogIn, LogOut } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { createClient } from "@/utils/supabase/client";

const NAV = [
  { href: "/", label: "Schedule", Icon: Calendar },
  { href: "/picks", label: "My Picks", Icon: Star },
  { href: "/about", label: "About", Icon: Info }
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, avatarUrl, ready } = useUser();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.refresh();
    router.push("/");
  };

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
        {ready && (
          <span className="ml-1 flex items-center gap-2 border-l border-black/10 pl-2">
            {email ? (
              <>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={email}
                    title={email}
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full border border-black/10 object-cover"
                  />
                ) : (
                  <span className="hidden text-xs text-black/50 lg:inline">{email}</span>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-black/5"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-black/5"
              >
                <LogIn size={16} />
                Sign in
              </Link>
            )}
          </span>
        )}
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
              {ready &&
                (email ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className="flex items-center gap-3 px-6 py-3 text-2xl font-semibold text-sxsw-black transition hover:text-sxsw-plum"
                  >
                    <LogOut size={28} />
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 text-2xl font-semibold text-sxsw-black transition hover:text-sxsw-plum"
                  >
                    <LogIn size={28} />
                    Sign in
                  </Link>
                ))}
            </nav>
            {email && (
              <div className="flex items-center justify-center gap-2 border-t border-black/10 px-4 py-3 text-xs text-black/50">
                {avatarUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt={email}
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-full border border-black/10 object-cover"
                    />
                    <span>{email}</span>
                  </>
                ) : (
                  <span>Signed in as {email}</span>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
