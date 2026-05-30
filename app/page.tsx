import { Suspense } from "react";
import { getSessions, getMeta } from "@/lib/data";
import { ScheduleBrowser } from "@/components/ScheduleBrowser";

export const dynamic = "force-static";

export default async function HomePage() {
  const [sessions, meta] = await Promise.all([getSessions(), getMeta()]);
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-black/40">Loading schedule...</div>}>
      <ScheduleBrowser sessions={sessions} meta={meta} />
    </Suspense>
  );
}
