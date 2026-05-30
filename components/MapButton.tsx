"use client";
import { useEffect, useState } from "react";

type Props = { query: string };

function googleUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function appleUrl(query: string) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

// Auto-detect the platform and prefer Apple Maps on Apple devices, falling back
// to Google Maps everywhere else. We can't truly probe "is Apple Maps installed"
// from the web, so the platform is the feasible proxy: on iOS/iPadOS/macOS the
// maps.apple.com link opens the Apple Maps app; on Android/Windows/Linux Google
// Maps is the universal choice. We render the Google href first (the SSR default,
// matched on first client paint) and switch to Apple after mount on Apple devices,
// so there is no hydration mismatch.
export function MapButton({ query }: Props) {
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    // iPadOS 13+ reports as "Macintosh", so the Mac check also covers it.
    setIsApple(/iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(ua));
  }, []);

  const href = isApple ? appleUrl(query) : googleUrl(query);
  const provider = isApple ? "Apple Maps" : "Google Maps";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-sxsw-black shadow-sm transition hover:border-black/30"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      Open in {provider}
    </a>
  );
}
