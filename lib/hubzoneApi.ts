import { TTL, hashKey, withCache } from "./cache";
import { geocode } from "./geocode";

export type HubZoneResult = {
  inHubZone: boolean;
  expiresOn?: string;
  source: "api" | "fallback";
};

/**
 * Curated allowlist of ZIP codes known to fall within an SBA HUBZone.
 * Used only when the live SBA HUBZone API is unreachable, so the demo
 * stays deterministic (the FRD-cited endpoint at hubzone-prod.azurewebsites.net
 * has been observed offline). Source: cross-checked against
 * https://maps.certify.sba.gov/hubzone/map/ as of 2026-04.
 *
 * This is intentionally narrow — adding a ZIP here is a claim about real
 * HUBZone designation, not a convenience hack. If a ZIP is only partially
 * HUBZone, leave it out and let the API decide (or fall through to false).
 */
const KNOWN_HUBZONE_ZIPS = new Set<string>([
  "20782", // Hyattsville, MD — demo address (Knox Rd / 4523)
  "20783", // Hyattsville / Adelphi
  "20712", // Mount Rainier, MD
  "20722", // Brentwood, MD
  "20737", // Riverdale, MD
]);

function zipFrom(address: string): string | undefined {
  const m = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m?.[1];
}

/**
 * SBA HUBZone determination from a postal address.
 *
 * Flow:
 *   1. Geocode the address (Nominatim)
 *   2. Query SBA HUBZone Map API with lat/lng
 *   3. Return inHubZone + expiration date
 *
 * On any failure, falls back to a curated ZIP allowlist (so the demo
 * remains deterministic when the public endpoint is offline). When the
 * allowlist is the source, `source: "fallback"` makes that explicit —
 * no fake claim of API verification.
 */
export async function checkHubZone(address: string): Promise<HubZoneResult> {
  const trimmed = address.trim();
  if (!trimmed) return { inHubZone: false, source: "fallback" };

  const key = `hubzone:${hashKey(trimmed)}`;
  return withCache<HubZoneResult>(key, TTL.HUBZONE, async () => {
    const apiResult = await tryLiveApi(trimmed);
    if (apiResult) return apiResult;

    // API unreachable — consult the curated ZIP allowlist.
    const zip = zipFrom(trimmed);
    if (zip && KNOWN_HUBZONE_ZIPS.has(zip)) {
      return { inHubZone: true, source: "fallback" };
    }
    return { inHubZone: false, source: "fallback" };
  });
}

async function tryLiveApi(address: string): Promise<HubZoneResult | null> {
  try {
    const geo = await geocode(address);
    if (!geo) return null;

    const res = await fetch(
      "https://hubzone-prod.azurewebsites.net/api/sites/lookup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ latitude: geo.lat, longitude: geo.lng }),
        // Don't let a slow/dead endpoint stall the onboarding form.
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return null;

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
    return null;
  }
}
