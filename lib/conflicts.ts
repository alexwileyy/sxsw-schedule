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

// For each session, the other sessions it *directly* overlaps in time. Unlike
// findConflicts (which merges a transitive chain of overlaps into one window for
// the summary), this is strict pairwise overlap - so a card only lists the events
// it actually clashes with, not everything in a merged window.
export function conflictsBySession(sessions: Session[]): Map<string, Session[]> {
  const usable = sessions.filter((s) => s.start && s.end);
  const map = new Map<string, Session[]>();
  for (let i = 0; i < usable.length; i++) {
    for (let j = i + 1; j < usable.length; j++) {
      const a = usable[i];
      const b = usable[j];
      const aStart = new Date(a.start!).getTime();
      const aEnd = new Date(a.end!).getTime();
      const bStart = new Date(b.start!).getTime();
      const bEnd = new Date(b.end!).getTime();
      if (aStart < bEnd && bStart < aEnd) {
        (map.get(a.id) ?? map.set(a.id, []).get(a.id)!).push(b);
        (map.get(b.id) ?? map.set(b.id, []).get(b.id)!).push(a);
      }
    }
  }
  return map;
}
