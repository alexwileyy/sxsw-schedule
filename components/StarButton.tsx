"use client";
import { useRouter } from "next/navigation";
import { useShortlist } from "@/lib/store";

export function StarButton({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) {
  const { has, toggle, authed, ready } = useShortlist();
  const router = useRouter();
  const saved = has(id);
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ready) return; // auth state still loading
    if (!authed) {
      const next = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    void toggle(id);
  };

  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from My Picks" : "Add to My Picks"}
      aria-pressed={saved}
      className={`${dim} ${icon} inline-flex items-center justify-center rounded-full border transition ${
        saved
          ? "border-sxsw-pink bg-sxsw-pink text-white"
          : "border-black/15 bg-white text-black/40 hover:border-sxsw-pink hover:text-sxsw-pink"
      }`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
