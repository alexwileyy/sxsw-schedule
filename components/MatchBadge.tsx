"use client";
import { useState } from "react";

export function MatchBadge({ score, reasons, compact = false }: { score: number; reasons?: string[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const tone =
    score >= 75 ? "bg-sxsw-pink text-white" :
    score >= 55 ? "bg-sxsw-plum text-white" :
    score >= 35 ? "bg-black/80 text-white" :
    "bg-black/10 text-black/60";
  const label = score >= 75 ? "Top pick" : score >= 55 ? "Strong" : score >= 35 ? "Maybe" : "Skip";
  const ringClass = score >= 85 ? "match-badge-high" : "";

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
        <span>{score}</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${tone} ${ringClass}`}
        title={reasons && reasons.length ? `Matched: ${reasons.join(", ")}` : undefined}
      >
        <span>{score}</span>
        <span className="opacity-90">{label}</span>
      </button>
      {open && reasons && reasons.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-black/10 bg-white p-3 text-xs shadow-lg">
          <div className="mb-1 font-semibold">Why this matches you</div>
          <ul className="list-disc pl-4 text-black/70">
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
