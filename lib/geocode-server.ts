import { env } from "@/lib/config/env";

export type GeocodeCoords = { lat: number; lng: number };

/**
 * Geocoding lato server (indirizzo testuale → lat/lng) via Google Geocoding API.
 * Usa GOOGLE_MAPS_API_KEY se presente, altrimenti NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export async function geocodeAddressIt(address: string): Promise<GeocodeCoords | null> {
  const query = address.trim();
  if (!query) return null;

  const apiKey = env.GOOGLE_MAPS_API_KEY || env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("region", "it");
  url.searchParams.set("language", "it");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: string;
    results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
  };

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
    return null;
  }

  const { lat, lng } = data.results[0].geometry.location;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
