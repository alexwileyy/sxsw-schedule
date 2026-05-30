"use client";
import { useRouter } from "next/navigation";

// Prefer an in-app back navigation (which restores the schedule's day/filters and
// scroll), so it works naturally whether you arrived from the home timeline or My
// Picks. When the session was opened directly or hard-refreshed there's no in-app
// entry to return to, so fall back to the schedule rather than leaving the app or
// doing nothing. Next's App Router keeps a history index (used for scroll
// restoration); idx === 0 means this is the first entry in the app's history.
export function BackButton() {
  const router = useRouter();

  const onClick = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    const canGoBack = typeof idx === "number" ? idx > 0 : window.history.length > 1;
    if (canGoBack) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black"
    >
      ← Back
    </button>
  );
}
