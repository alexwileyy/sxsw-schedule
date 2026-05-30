"use client";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/types";
import { useShortlist } from "@/lib/store";
import { findConflicts, conflictsBySession } from "@/lib/conflicts";
import { downloadIcs } from "@/lib/ics";
import { fmtDayLong, fmtTime, londonDayKey } from "@/lib/format";
import { SessionCard } from "./SessionCard";

// Sub-group a day's sessions by venue. Items arrive already sorted by start time,
// so each venue's list stays chronological and we order the venue groups by their
// earliest session - keeping the day reading roughly top-to-bottom in time.
function groupByVenue(items: Session[]): [string, Session[]][] {
  const m = new Map<string, Session[]>();
  for (const s of items) {
    const k = s.venue ?? "Location TBA";
    const arr = m.get(k) ?? [];
    arr.push(s);
    m.set(k, arr);
  }
  return [...m.entries()].sort((a, b) => ((a[1][0]?.start ?? "") < (b[1][0]?.start ?? "") ? -1 : 1));
}

export function MyPicksClient({ allSessions }: { allSessions: Session[] }) {
  const { ids, clear, ready } = useShortlist();
  const [byVenue, setByVenue] = useState(false);

  const picks = useMemo(
    () => allSessions.filter((s) => ids.has(s.id)).sort((a, b) => (a.start! < b.start! ? -1 : 1)),
    [allSessions, ids]
  );

  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>();
    for (const p of picks) {
      const k = londonDayKey(p.start);
      if (!k) continue;
      const arr = m.get(k) ?? [];
      arr.push(p);
      m.set(k, arr);
    }
    return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [picks]);

  const conflictsByDay = useMemo(() => {
    return byDay.map(([day, items]) => [day, findConflicts(items)] as const);
  }, [byDay]);

  const onExport = () => {
    if (picks.length === 0) return;
    downloadIcs("sxsw-london-2026.ics", picks);
  };

  // Strict pairwise overlaps, keyed by session id - powers both the per-card
  // "clashes with" callout and the amber ring. Different days never overlap, so
  // computing across all picks at once is safe and simpler than per-day.
  const conflictMap = useMemo(() => conflictsBySession(picks), [picks]);

  const totalConflicts = conflictsByDay.reduce((sum, [, g]) => sum + g.length, 0);

  if (!ready) {
    return (
      <div className="rounded-3xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-black/50">
        Loading your picks...
      </div>
    );
  }

  if (picks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/15 bg-white p-10 text-center">
        <div className="text-5xl">☆</div>
        <h2 className="mt-3 font-display text-2xl">No picks yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-black/60">
          Star sessions from the schedule and they'll land here. Once you've picked a few, we'll surface scheduling
          conflicts and let you export everything to your calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-sxsw-black p-6 text-sxsw-cream sm:p-8">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-sxsw-lime">My Picks</div>
          <h1 className="mt-1 font-display text-3xl">{picks.length} sessions saved</h1>
          <p className="mt-1 text-sm text-sxsw-cream/70">
            {totalConflicts > 0
              ? `${totalConflicts} time overlap${totalConflicts === 1 ? "" : "s"} to resolve.`
              : "No conflicts. Looks tight."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExport}
            className="rounded-full bg-sxsw-lime px-5 py-2 text-sm font-semibold text-sxsw-black hover:brightness-95"
          >
            Export to calendar (.ics)
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all picks? This can't be undone.")) clear();
            }}
            className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/10"
          >
            Clear all
          </button>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <label className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={byVenue}
            onChange={(e) => setByVenue(e.target.checked)}
            className="accent-sxsw-pink"
          />
          Group by location
        </label>
      </div>

      {byDay.map(([day, items], i) => {
        const conflicts = conflictsByDay[i][1];
        const renderCard = (s: Session) => {
          const clashes = conflictMap.get(s.id) ?? [];
          return (
            <div
              key={s.id}
              className={clashes.length > 0 ? "rounded-2xl ring-2 ring-amber-300" : ""}
            >
              <SessionCard s={s} conflictsWith={clashes} />
            </div>
          );
        };
        return (
          <section key={day} className="space-y-3">
            <header className="flex items-baseline justify-between">
              <h2 className="font-display text-xl">{fmtDayLong(day)}</h2>
              <span className="text-xs text-black/60">{items.length} sessions</span>
            </header>

            {conflicts.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm">
                <div className="font-semibold text-amber-900">⚠ Time conflicts</div>
                {conflicts.map((c, idx) => (
                  <div key={idx} className="text-amber-900/90">
                    {fmtTime(c.start)}-{fmtTime(c.end)}:{" "}
                    {c.sessions.map((s) => s.title).join("  vs.  ")}
                  </div>
                ))}
              </div>
            )}

            {byVenue ? (
              <div className="space-y-4">
                {groupByVenue(items).map(([venue, vItems]) => (
                  <div key={venue} className="space-y-2.5">
                    <div className="flex items-baseline justify-between border-b border-black/10 pb-1">
                      <h3 className="text-sm font-semibold text-sxsw-plum">{venue}</h3>
                      <span className="text-xs text-black/50">{vItems.length} sessions</span>
                    </div>
                    {vItems.map(renderCard)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">{items.map(renderCard)}</div>
            )}
          </section>
        );
      })}
    </div>
  );
}
