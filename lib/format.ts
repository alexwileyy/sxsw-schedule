// Pure helpers used on both server and client. Always render times in Europe/London
// regardless of the user's local timezone, since this is a London festival.

const LON = "Europe/London";

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: LON
  }).format(d);
}

export function fmtDayLong(iso: string): string {
  // iso may be "2026-06-01" or full ISO
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: LON
  }).format(d);
}

export function fmtDayShort(iso: string): string {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    timeZone: LON
  }).format(d);
}

export function londonDayKey(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Use Intl to derive London-local Y-M-D
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: LON
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

export function durationMin(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

export function minutesSinceMidnightLondon(iso: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: LON
  }).formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return parseInt(m.hour ?? "0", 10) * 60 + parseInt(m.minute ?? "0", 10);
}

export function plain(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
