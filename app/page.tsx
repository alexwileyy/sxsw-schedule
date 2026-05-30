import { getSessions, getMeta } from "@/lib/data";
import { ScheduleBrowser } from "@/components/ScheduleBrowser";

export const dynamic = "force-static";

export default async function HomePage() {
  const [sessions, meta] = await Promise.all([getSessions(), getMeta()]);
  return <ScheduleBrowser sessions={sessions} meta={meta} />;
}
