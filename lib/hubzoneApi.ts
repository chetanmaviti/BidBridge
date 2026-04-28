import { TTL, hashKey, withCache } from "./cache";
import { geocode } from "./geocode";

export type HubZoneResult = {
  inHubZone: boolean;
  expiresOn?: string;
  source: "api" | "fallback";
};

/**
 * Curated ZIP allowlist — last resort when both live APIs are unreachable.
 * Only add ZIPs that are definitively in a HubZone per maps.certify.sba.gov.
 */
const KNOWN_HUBZONE_ZIPS = new Set<string>([
  "20782", // Hyattsville, MD
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
 *   1. Query the SBA HUBZone Map search API (maps.certify.sba.gov) — most
 *      reliable; this is the backend that powers the official SBA map.
 *   2. Fall back to the legacy hubzone-prod endpoint using geocoded lat/lng.
 *   3. Last resort: curated ZIP allowlist.
 */
export async function checkHubZone(address: string): Promise<HubZoneResult> {
  const trimmed = address.trim();
  if (!trimmed) return { inHubZone: false, source: "fallback" };

  const key = `hubzone:${hashKey(trimmed)}`;
  return withCache<HubZoneResult>(key, TTL.HUBZONE, async () => {
    const apiResult = await tryLiveApi(trimmed);
    if (apiResult) return apiResult;

    const zip = zipFrom(trimmed);
    if (zip && KNOWN_HUBZONE_ZIPS.has(zip)) {
      return { inHubZone: true, source: "fallback" };
    }
    return { inHubZone: false, source: "fallback" };
  });
}

async function tryLiveApi(address: string): Promise<HubZoneResult | null> {
  // Primary: SBA HUBZone Map search (backs maps.certify.sba.gov)
  const certify = await tryCertifyMapApi(address);
  if (certify) return certify;

  // Secondary: legacy hubzone-prod REST endpoint (frequently offline)
  const legacy = await tryLegacySbaApi(address);
  if (legacy) return legacy;

  return null;
}

/**
 * SBA Certify HUBZone Map search API.
 * Accepts a plain address string; the SBA handles geocoding on their end.
 * Response is a JS snippet wrapping a JSON object — we extract and parse it.
 */
async function tryCertifyMapApi(address: string): Promise<HubZoneResult | null> {
  try {
    const url = new URL("https://maps.certify.sba.gov/hubzone/map/search");
    url.searchParams.set("search", address);

    const res = await fetch(url, {
      headers: {
        Accept: "text/javascript, application/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const text = await res.text();

    // The response embeds: var response = JSON.parse('{ ... }');
    // Capture everything between JSON.parse(' and '); handling escaped quotes.
    const match = text.match(/JSON\.parse\('((?:[^'\\]|\\.)*)'\)/);
    if (!match) return null;

    const jsonStr = match[1].replace(/\\'/g, "'");
    const data = JSON.parse(jsonStr) as {
      hubzone?: Array<{ current_status?: string; expires?: string | null }>;
      until_date?: string | null;
    };

    const entries = data.hubzone ?? [];
    const inHubZone = entries.some((h) => h.current_status === "Qualified");
    const expires =
      data.until_date ??
      entries.find((h) => h.expires)?.expires ??
      undefined;

    return {
      inHubZone,
      expiresOn: expires ?? undefined,
      source: "api",
    };
  } catch {
    return null;
  }
}

/**
 * Legacy SBA HUBZone REST endpoint (hubzone-prod.azurewebsites.net).
 * Requires geocoding the address first via Nominatim.
 */
async function tryLegacySbaApi(address: string): Promise<HubZoneResult | null> {
  try {
    const geo = await geocode(address);
    if (!geo) return null;

    const res = await fetch(
      "https://hubzone-prod.azurewebsites.net/api/sites/lookup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ latitude: geo.lat, longitude: geo.lng }),
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
