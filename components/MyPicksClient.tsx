"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Session } from "@/lib/types";
import { useShortlist } from "@/lib/store";
import { findConflicts, conflictsBySession } from "@/lib/conflicts";
import { downloadIcs } from "@/lib/ics";
import { fmtDayLong, fmtTime, londonDayKey } from "@/lib/format";
import { walkMinutesBetweenVenues } from "@/lib/walking";
import { SessionCard } from "./SessionCard";
import { WalkConnector } from "./WalkConnector";
import { DayBar } from "./DayBar";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { ids, clear, ready } = useShortlist();
  // Read from the URL so back-navigation restores the grouping; reset on fresh visit.
  const [byVenue, setByVenue] = useState(() => searchParams.get("group") === "venue");

  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    router.replace(byVenue ? `${pathname}?group=venue` : pathname, { scroll: false });
  }, [byVenue, pathname, router]);

  const picks = useMemo(
    () => allSessions.filter((s) => ids.has(s.id)).sort((a, b) => (a.start! < b.start! ? -1 : 1)),
    [allSessions, ids]
  );

  // The soonest pick that hasn't finished yet - surfaced in the header. picks are
  // already sorted by start, so the first one still ahead of "now" is next up.
  const nextSession = useMemo(() => {
    const now = Date.now();
    return (
      picks.find((p) => {
        const t = p.end ?? p.start;
        return t ? new Date(t).getTime() >= now : false;
      }) ?? null
    );
  }, [picks]);

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

  // Day selector: only days that actually have picks. Defaults to the day of the
  // next session, falling back to the first day with picks. Falls back gracefully
  // if the selected day no longer has any picks.
  const dayKeys = useMemo(() => byDay.map(([d]) => d), [byDay]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const defaultDay = nextSession?.start ? londonDayKey(nextSession.start) : null;
  const activeDay =
    selectedDay && dayKeys.includes(selectedDay)
      ? selectedDay
      : defaultDay && dayKeys.includes(defaultDay)
        ? defaultDay
        : dayKeys[0] ?? null;

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
      <section className="rounded-3xl bg-sxsw-black p-6 text-sxsw-cream sm:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-sxsw-lime">Your next session</div>
        {nextSession ? (
          <div className="mt-2">
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">{nextSession.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-sxsw-cream/80">
              <span className="font-mono font-semibold text-sxsw-cream">
                {nextSession.start ? fmtDayLong(nextSession.start) : ""}
                {nextSession.start ? ` · ${fmtTime(nextSession.start)}` : ""}
                {nextSession.end ? ` - ${fmtTime(nextSession.end)}` : ""}
              </span>
              {nextSession.venue && (
                <span>
                  · {nextSession.venue}
                  {nextSession.hall ? <span className="text-sxsw-cream/60"> ({nextSession.hall})</span> : null}
                </span>
              )}
            </div>
            <Link
              href={`/session/${nextSession.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sxsw-lime px-5 py-2 text-sm font-semibold text-sxsw-black hover:brightness-95"
            >
              Open session →
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-sxsw-cream/80">
            No upcoming sessions in your picks - you&apos;re all caught up.
          </p>
        )}
        {totalConflicts > 0 && (
          <p className="mt-5 text-xs text-sxsw-cream/60">
            {totalConflicts} time overlap{totalConflicts === 1 ? "" : "s"} to resolve
          </p>
        )}
      </section>

      {dayKeys.length > 0 && activeDay && (
        <DayBar
          days={dayKeys}
          selected={activeDay}
          onSelect={setSelectedDay}
          count={(d) => byDay.find(([k]) => k === d)?.[1].length ?? 0}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={byVenue}
            onChange={(e) => setByVenue(e.target.checked)}
            className="accent-sxsw-pink"
          />
          Group by location
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExport}
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black/60 hover:border-black/30 hover:text-black"
          >
            Export to calendar (.ics)
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all picks? This can't be undone.")) clear();
            }}
            className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black/60 hover:border-black/30 hover:text-black"
          >
            Clear all
          </button>
        </div>
      </div>

      {byDay.map(([day, items], i) => {
        if (day !== activeDay) return null;
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
              // No space-y here: a card preceded by a walking connector sits flush
              // against it (mt-0) so the dotted line bridges the two cards
              // seamlessly; otherwise cards keep the usual 2.5 gap.
              <div>
                {items.map((s, idx) => {
                  // Between consecutive picks at a different venue, show the walking
                  // time. Only here (day view) - never when grouped by location.
                  const prev = idx > 0 ? items[idx - 1] : null;
                  const moving = !!(prev && prev.venue && s.venue && prev.venue !== s.venue);
                  const clashes = conflictMap.get(s.id) ?? [];
                  return (
                    <Fragment key={s.id}>
                      {moving && (
                        <WalkConnector minutes={walkMinutesBetweenVenues(prev!.venue, s.venue)} />
                      )}
                      <div
                        className={`${idx === 0 || moving ? "" : "mt-2.5"} ${
                          clashes.length > 0 ? "rounded-2xl ring-2 ring-amber-300" : ""
                        }`}
                      >
                        <SessionCard s={s} conflictsWith={clashes} />
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
