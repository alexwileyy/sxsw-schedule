import { Footprints } from "lucide-react";

// Dotted line between two consecutive picks at different venues, with a walking
// icon and the estimated walking time. Shown only in the My Picks day view.
export function WalkConnector({ minutes }: { minutes: number | null }) {
  return (
    <div className="flex items-stretch gap-3 pl-6">
      <div className="ml-px border-l-2 border-dotted border-black/25" />
      <div className="flex items-center gap-1.5 py-3 text-xs font-medium text-black/50">
        <Footprints size={14} />
        {minutes != null ? <span>~{minutes} min walk</span> : <span>Different venue</span>}
      </div>
    </div>
  );
}
