"use client";
import { useRouter } from "next/navigation";

// Goes back one step in the browser history rather than always returning to the
// schedule, so it works naturally whether you arrived from the home timeline or
// from My Picks. If there's no history to pop (e.g. the page was opened directly
// or in a new tab), fall back to the schedule home.
export function BackButton() {
  const router = useRouter();

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
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
