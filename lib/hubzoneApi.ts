import { TTL, hashKey, withCache } from "./cache";
import { geocode } from "./geocode";

export type HubZoneResult = {
  inHubZone: boolean;
  expiresOn?: string;
  source: "api" | "fallback";
};

/**
 * SBA HUBZone determination from a postal address.
 *
 * Flow:
 *   1. Geocode the address (Nominatim)
 *   2. Query SBA HUBZone Map API with lat/lng
 *   3. Return inHubZone + expiration date
 *
 * On any failure, falls back to { inHubZone: false } (FRD §9 — non-blocking).
 */
export async function checkHubZone(address: string): Promise<HubZoneResult> {
  const trimmed = address.trim();
  if (!trimmed) return { inHubZone: false, source: "fallback" };

  const key = `hubzone:${hashKey(trimmed)}`;
  return withCache<HubZoneResult>(key, TTL.HUBZONE, async () => {
    try {
      const geo = await geocode(trimmed);
      if (!geo) return { inHubZone: false, source: "fallback" };

      // SBA HUBZone Map API. The endpoint accepts a POST with lat/lng
      // and returns whether the point falls within a current HUBZone polygon.
      const res = await fetch(
        "https://hubzone-prod.azurewebsites.net/api/sites/lookup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ latitude: geo.lat, longitude: geo.lng }),
        }
      );
      if (!res.ok) return { inHubZone: false, source: "fallback" };

      const data = (await res.json()) as {
        inHubZone?: boolean;
        in_hubzone?: boolean;
        hubzone?: boolean;
        qualified?: boolean;
        expires?: string;
        expirationDate?: string;
      };

      const inHubZone =
        data.inHubZone ?? data.in_hubzone ?? data.hubzone ?? data.qualified ?? false;

      return {
        inHubZone: Boolean(inHubZone),
        expiresOn: data.expires ?? data.expirationDate,
        source: "api",
      };
    } catch {
      return { inHubZone: false, source: "fallback" };
    }
  });
}
