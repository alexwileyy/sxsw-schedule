import { getSessions } from "@/lib/data";
import { MyPicksClient } from "@/components/MyPicksClient";

export const dynamic = "force-static";

export default async function PicksPage() {
  const sessions = await getSessions();
  return <MyPicksClient allSessions={sessions} />;
}
