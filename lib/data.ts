import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Session, Meta } from "./types";

let cached: { sessions: Session[]; meta: Meta } | null = null;

export async function loadData(): Promise<{ sessions: Session[]; meta: Meta }> {
  if (cached) return cached;
  const dir = path.join(process.cwd(), "public", "data");
  const [s, m] = await Promise.all([
    fs.readFile(path.join(dir, "sessions.json"), "utf8"),
    fs.readFile(path.join(dir, "meta.json"), "utf8")
  ]);
  cached = { sessions: JSON.parse(s) as Session[], meta: JSON.parse(m) as Meta };
  return cached;
}

export async function getSessions(): Promise<Session[]> {
  return (await loadData()).sessions;
}

export async function getMeta(): Promise<Meta> {
  return (await loadData()).meta;
}

export async function getSessionBySlug(slug: string): Promise<Session | undefined> {
  const sessions = await getSessions();
  return sessions.find((s) => s.slug === slug);
}
