"use client";
import { useMemo, useState } from "react";
import type { Session, Meta } from "@/lib/types";
import { fmtDayLong, fmtDayShort, londonDayKey, plain } from "@/lib/format";
import { SessionCard } from "./SessionCard";
import { useShortlist } from "@/lib/store";

type Props = { sessions: Session[]; meta: Meta };

const SORT_OPTIONS = [
  { id: "time", label: "By time" },
  { id: "score", label: "By match score" }
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];

export function ScheduleBrowser({ sessions, meta }: Props) {
  const days = meta.days;
  const [day, setDay] = useState<string>(days[0] ?? "");
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [venues, setVenues] = useState<Set<string>>(new Set());
  const [minScore, setMinScore] = useState<number>(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<SortId>("time");
  const [showFilters, setShowFilters] = useState(false);

  const { has } = useShortlist();

  // Pre-index by day in London tz
  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      const k = londonDayKey(s.start);
      if (!k) continue;
      const list = map.get(k) ?? [];
      list.push(s);
      map.set(k, list);
    }
    return map;
  }, [sessions]);

  const dayList = byDay.get(day) ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = dayList;
    if (q) {
      out = out.filter((s) =>
        (s.title?.toLowerCase().includes(q)) ||
        (plain(s.description).toLowerCase().includes(q)) ||
        (s.venue?.toLowerCase().includes(q)) ||
        (s.categories.some((c) => c.toLowerCase().includes(q)))
      );
    }
    if (cats.size) out = out.filter((s) => s.categories.some((c) => cats.has(c)));
    if (venues.size) out = out.filter((s) => s.venue && venues.has(s.venue));
    if (minScore > 0) out = out.filter((s) => s.score >= minScore);
    if (savedOnly) out = out.filter((s) => has(s.id));
    if (sort === "score") {
      out = [...out].sort((a, b) => (b.score - a.score) || (a.start! < b.start! ? -1 : 1));
    } else {
      out = [...out].sort((a, b) => (a.start! < b.start! ? -1 : 1));
    }
    return out;
  }, [dayList, query, cats, venues, minScore, savedOnly, sort, has]);

  // Group by hour for the timeline view (only when sort === "time")
  const grouped = useMemo(() => {
    if (sort !== "time") return null;
    const buckets = new Map<string, Session[]>();
    for (const s of filtered) {
      if (!s.start) continue;
      // bucket label like "09:00", "14:00"
      const d = new Date(s.start);
      const hour = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: undefined as unknown as undefined,
        hour12: false, timeZone: "Europe/London"
      }).format(d).slice(0, 2);
      const key = `${hour}:00`;
      const arr = buckets.get(key) ?? [];
      arr.push(s);
      buckets.set(key, arr);
    }
    return [...buckets.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [filtered, sort]);

  const topCats = meta.categories.slice(0, 18);
  const topVenues = meta.venues.slice(0, 12);

  const toggleSet = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    setter(next);
  };

  const recommendedCount = dayList.filter((s) => s.score >= 55).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-sxsw-black via-sxsw-ink to-sxsw-plum p-6 text-sxsw-cream sm:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-sxsw-lime">For Alex · Gocertify</div>
        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
          {meta.total.toLocaleString()} sessions across 6 days.
          <br />
          <span className="text-sxsw-lime">Here are the ones worth your time.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-sxsw-cream/80">
          Every session is scored 0-100 for relevance to a Techie track: AI, engineering deep-dives, deep tech ventures,
          and identity/trust signals that map to Gocertify's space. Star sessions to build a personal agenda with conflict
          warnings and a calendar export.
        </p>
      </section>

      {/* Day tabs */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 scrollbar-thin">
        <div className="flex min-w-max gap-2">
          {days.map((d) => {
            const active = d === day;
            const count = byDay.get(d)?.length ?? 0;
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`flex flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition ${
                  active
                    ? "border-sxsw-black bg-sxsw-black text-sxsw-cream"
                    : "border-black/10 bg-white text-sxsw-black hover:border-black/30"
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                  {fmtDayShort(d)}
                </span>
                <span className="text-base font-semibold">{fmtDayLong(d).replace(/, .*$/, "")}</span>
                <span className="text-[11px] opacity-70">{count} sessions</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="search"
            placeholder="Search titles, descriptions, venues..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-black/15 bg-white px-4 py-2 pr-10 text-sm shadow-sm focus:border-sxsw-pink focus:outline-none focus:ring-2 focus:ring-sxsw-pink/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
              ✕
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortId)}
          className="rounded-full border border-black/15 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
            className="accent-sxsw-pink"
          />
          Saved only
        </label>
        <label className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-sm">
          Min match
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
            className="w-24 accent-sxsw-pink"
          />
          <span className="w-8 font-mono text-xs text-black/60">{minScore}</span>
        </label>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="rounded-full border border-black/15 bg-white px-3 py-2 text-sm hover:border-black/30"
        >
          {showFilters ? "Hide" : "More"} filters
          {(cats.size + venues.size) > 0 && (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-sxsw-pink px-1.5 text-[10px] font-bold text-white">
              {cats.size + venues.size}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="grid gap-4 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/60">Categories</div>
            <div className="flex flex-wrap gap-1.5">
              {topCats.map(([c, n]) => {
                const on = cats.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleSet(cats, setCats, c)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on
                        ? "border-sxsw-pink bg-sxsw-pink text-white"
                        : "border-black/15 bg-white text-black/70 hover:border-black/30"
                    }`}
                  >
                    {c} <span className="opacity-60">· {n}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/60">Venues</div>
            <div className="flex flex-wrap gap-1.5">
              {topVenues.map(([v, n]) => {
                const on = venues.has(v);
                return (
                  <button
                    key={v}
                    onClick={() => toggleSet(venues, setVenues, v)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on
                        ? "border-sxsw-plum bg-sxsw-plum text-white"
                        : "border-black/15 bg-white text-black/70 hover:border-black/30"
                    }`}
                  >
                    {v} <span className="opacity-60">· {n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Day header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-2xl">{day ? fmtDayLong(day) : ""}</h2>
          <p className="text-sm text-black/60">
            {filtered.length} of {dayList.length} sessions · {recommendedCount} match-strong (55+) today
          </p>
        </div>
      </div>

      {/* Timeline / list */}
      {sort === "time" && grouped ? (
        <div className="space-y-6">
          {grouped.length === 0 && (
            <div className="rounded-xl border border-dashed border-black/15 bg-white p-8 text-center text-black/50">
              Nothing matches your filters today.
            </div>
          )}
          {grouped.map(([hour, items]) => (
            <section key={hour} className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <div className="sticky top-20 hidden self-start sm:block">
                <div className="font-mono text-xl font-bold text-sxsw-plum">{hour}</div>
                <div className="text-xs text-black/40">{items.length} on</div>
              </div>
              <div className="space-y-2.5">
                <div className="text-sm font-semibold text-sxsw-plum sm:hidden">{hour}</div>
                {items.map((s) => <SessionCard key={s.id} s={s} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-black/15 bg-white p-8 text-center text-black/50">
              Nothing matches your filters.
            </div>
          )}
          {filtered.map((s) => <SessionCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}
