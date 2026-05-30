"use client";
import Link from "next/link";
import type { Session } from "@/lib/types";
import { fmtTime, durationMin, plain } from "@/lib/format";
import { MatchBadge } from "./MatchBadge";
import { StarButton } from "./StarButton";

export function SessionCard({ s, conflictsWith }: { s: Session; conflictsWith?: Session[] }) {
  const dur = durationMin(s.start, s.end);
  const isTop = s.score >= 75;
  return (
    <Link
      href={`/session/${s.slug}`}
      className={`group relative block rounded-2xl border bg-white p-4 transition hover:shadow-md ${
        isTop ? "border-sxsw-pink/40" : "border-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
            <span className="font-mono font-semibold text-black">
              {fmtTime(s.start)}{s.end ? ` - ${fmtTime(s.end)}` : ""}
            </span>
            {dur > 0 && <span className="text-black/40">· {dur} min</span>}
            {s.canceled && <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold uppercase text-red-700">Cancelled</span>}
            {s.featured && !s.canceled && <span className="rounded bg-sxsw-lime/70 px-1.5 py-0.5 font-semibold uppercase text-sxsw-black">Featured</span>}
          </div>
          <h3 className="mt-1 font-semibold leading-tight text-sxsw-black group-hover:text-sxsw-plum">
            {s.title}
          </h3>
          {s.venue && (
            <p className="mt-1 text-xs text-black/60">
              {s.venue}{s.hall ? <span className="text-black/40"> · {s.hall}</span> : null}
            </p>
          )}
          {s.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {s.categories.slice(0, 3).map((c) => (
                <span key={c} className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-black/60">
                  {c}
                </span>
              ))}
            </div>
          )}
          {s.description && (
            <p className="mt-2 line-clamp-2 text-sm text-black/70">{plain(s.description)}</p>
          )}
          {conflictsWith && conflictsWith.length > 0 && (
            <div className="mt-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <div className="font-semibold">⚠ Clashes with</div>
              <ul className="mt-1 space-y-0.5">
                {conflictsWith.map((c) => (
                  <li key={c.id}>
                    {fmtTime(c.start)}-{fmtTime(c.end)} · {c.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StarButton id={s.id} />
          <MatchBadge score={s.score} reasons={s.reasons} />
        </div>
      </div>
    </Link>
  );
}
