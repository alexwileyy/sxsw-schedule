"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating button that appears once the user has scrolled more than one full
// viewport height from the top, and smooth-scrolls back up when clicked. Sits
// below the mobile menu overlay (z-50) so it never covers it.
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sxsw-black text-sxsw-cream shadow-lg transition-all hover:brightness-125 ${
        show ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
