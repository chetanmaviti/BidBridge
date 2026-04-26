import { TTL, hashKey, withCache } from "./cache";

// Re-export pure helpers for back-compat. New code should import directly
// from "@/lib/geo" so the server-only `geocode()` below isn't dragged into
// client bundles via this file.
export { STATE_CENTROIDS, haversineMiles, sameRegion } from "./geo";

export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName?: string;
};

/**
 * Server-only — geocode an address via the Nominatim public API.
 * Free tier — must include a User-Agent identifying the app.
 *
 * Do not import this file from client components: it pulls in
 * ./cache → node:crypto, which webpack cannot bundle for the browser.
 */
export async function geocode(address: string): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const key = `geocode:${hashKey(trimmed)}`;
  return withCache<GeocodeResult | null>(key, TTL.GEOCODE, async () => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us");

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Bid/0.4 (federal-contracts-mvp; contact: bid@example.com)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  });
}
