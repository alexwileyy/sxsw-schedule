import type { Session } from "./types";

export type ConflictGroup = {
  start: string;
  end: string;
  sessions: Session[];
};

export function findConflicts(sessions: Session[]): ConflictGroup[] {
  // Sort by start
  const sorted = [...sessions]
    .filter((s) => s.start && s.end)
    .sort((a, b) => (a.start! < b.start! ? -1 : 1));

  const groups: ConflictGroup[] = [];
  for (const s of sorted) {
    const last = groups[groups.length - 1];
    if (last && new Date(s.start!).getTime() < new Date(last.end).getTime()) {
      last.sessions.push(s);
      // extend window end if needed
      if (new Date(s.end!).getTime() > new Date(last.end).getTime()) last.end = s.end!;
    } else {
      groups.push({ start: s.start!, end: s.end!, sessions: [s] });
    }
  }
  return groups.filter((g) => g.sessions.length > 1);
}
