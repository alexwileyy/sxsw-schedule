import type { Session } from "./types";

function pad(n: number) { return n.toString().padStart(2, "0"); }

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function plain(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildIcs(sessions: Session[]): string {
  const now = toIcsDate(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gocertify//SXSW London 2026 Visualiser//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SXSW London 2026 - My Picks",
    "X-WR-TIMEZONE:Europe/London"
  ];
  for (const s of sessions) {
    if (!s.start || !s.end) continue;
    const loc = [s.venue, s.hall].filter(Boolean).join(" - ");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${s.id}@sxsw-london-2026`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${toIcsDate(s.start)}`);
    lines.push(`DTEND:${toIcsDate(s.end)}`);
    lines.push(`SUMMARY:${esc(s.title)}`);
    lines.push(`LOCATION:${esc(loc)}`);
    lines.push(`DESCRIPTION:${esc(plain(s.description))}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, sessions: Session[]) {
  const ics = buildIcs(sessions);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 250);
}
