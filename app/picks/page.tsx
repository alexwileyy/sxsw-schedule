import { Suspense } from "react";
import { getSessions } from "@/lib/data";
import { MyPicksClient } from "@/components/MyPicksClient";

export const dynamic = "force-static";

export default async function PicksPage() {
  const sessions = await getSessions();
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-black/40">Loading...</div>}>
      <MyPicksClient allSessions={sessions} />
    </Suspense>
  );
}
