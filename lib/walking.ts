import { getVenueCoords } from "./venues";

// Offline walking-time estimate between two venues. We don't call a routing API:
// the venues are tightly clustered in Shoreditch/Spitalfields, so a straight-line
// (Haversine) distance, padded by a detour factor for the street grid and divided
// by an average walking speed, is plenty accurate for "when do I need to leave"
// guidance. Deterministic and works offline, in keeping with the static data set.

const WALK_SPEED_M_PER_MIN = 95; // ~4.8 km/h
const DETOUR_FACTOR = 1; // streets aren't straight lines
const EARTH_RADIUS_M = 6_371_000;

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Estimated walking minutes between two venues, or null if either lacks
// coordinates or they're the same venue. Always at least 1 minute.
export function walkMinutesBetweenVenues(from: string | null, to: string | null): number | null {
  if (!from || !to || from === to) return null;
  const a = getVenueCoords(from);
  const b = getVenueCoords(to);
  if (!a || !b) return null;
  const meters = haversineMeters(a, b) * DETOUR_FACTOR;
  return Math.max(1, Math.round(meters / WALK_SPEED_M_PER_MIN));
}
