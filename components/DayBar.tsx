"use client";
import { useEffect, useRef, useState } from "react";
import { fmtDayShort, fmtDayLong } from "@/lib/format";

type Props = {
  days: string[];
  selected: string;
  onSelect: (day: string) => void;
  count?: (day: string) => number;
  // Reports the stuck state and the bar's bottom offset (header + bar height) so a
  // parent can dock its own sticky elements (e.g. the timeline hour labels) just
  // below the bar instead of behind it.
  onStickyChange?: (info: { stuck: boolean; offset: number }) => void;
};

// Horizontally-scrollable day selector that sticks below the top header once
// scrolled past, turning into a sub-nav bar. Shared by the schedule and My Picks.
// "stuck" is detected from the bar's own position: when it pins, its top equals
// the header height (a scroll listener avoids containing-block pitfalls).
export function DayBar({ days, selected, onSelect, count, onStickyChange }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(57);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const header = document.querySelector("header");
    const measure = () => setHeaderH(header?.offsetHeight ?? 57);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current;
      if (el) setStuck(el.getBoundingClientRect().top <= headerH);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerH]);

  useEffect(() => {
    onStickyChange?.({ stuck, offset: headerH + (barRef.current?.offsetHeight ?? 0) });
  }, [stuck, headerH, onStickyChange]);

  return (
    <div
      ref={barRef}
      style={{ top: headerH }}
      className={`no-scrollbar sticky z-20 -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 ${
        stuck ? "border-b border-black/10 bg-sxsw-cream/90 py-2 backdrop-blur" : ""
      }`}
    >
      <div className="flex min-w-max gap-2">
        {days.map((d) => {
          const active = d === selected;
          const n = count?.(d);
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition ${
                active
                  ? "border-sxsw-black bg-sxsw-black text-sxsw-cream"
                  : "border-black/10 bg-white text-sxsw-black hover:border-black/30"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">{fmtDayShort(d)}</span>
              <span className="text-base font-semibold">{fmtDayLong(d).replace(/, .*$/, "")}</span>
              {n != null && <span className="text-[11px] opacity-70">{n} sessions</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
