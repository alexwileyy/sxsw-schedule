import venuesData from "@/public/data/venues.json";

type VenueEntry = { address: string; confidence: "high" | "medium" | "low"; note?: string };

const VENUES = (venuesData as { venues: Record<string, VenueEntry> }).venues;

export function getVenueAddress(venue: string | null): string | null {
  if (!venue) return null;
  return VENUES[venue]?.address ?? null;
}

// Build the query string handed to Apple/Google Maps. Prefer the known street
// address (precise, postcode-anchored); fall back to the bare venue name plus
// "London" so an unmapped venue still drops a roughly-right pin instead of breaking.
export function buildMapQuery(venue: string | null): string | null {
  if (!venue) return null;
  const address = getVenueAddress(venue);
  if (address) return `${venue}, ${address}`;
  return `${venue}, London`;
}
