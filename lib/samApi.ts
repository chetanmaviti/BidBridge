import type { Opportunity, SetAsideCode } from "./types";
import { TTL, cacheGet, cacheSet, hashKey } from "./cache";
import { normalizeSamSetAside, samSetAsideFilterCode } from "./setAsides";

const SAM_BASE = "https://api.sam.gov/opportunities/v2/search";

export type SamSearchParams = {
  naicsCodes?: string[];
  setAsides?: SetAsideCode[];
  state?: string;          // user state for geographic filter
  postedFromDays?: number; // default 30
  ptype?: string;          // default "o,k" (Solicitation + Combined Synopsis/Solicitation)
  limit?: number;          // default 25
};

function fmtDate(d: Date): string {
  // SAM.gov requires MM/dd/yyyy
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

function buildSamUrl(params: SamSearchParams): URL {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) throw new Error("SAM_API_KEY env var is not set");

  const url = new URL(SAM_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", String(params.limit ?? 25));
  url.searchParams.set("ptype", params.ptype ?? "o,k");

  const today = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (params.postedFromDays ?? 30));
  url.searchParams.set("postedFrom", fmtDate(from));
  url.searchParams.set("postedTo", fmtDate(today));

  if (params.naicsCodes?.length) {
    url.searchParams.set("ncode", params.naicsCodes.join(","));
  }
  if (params.setAsides?.length) {
    url.searchParams.set(
      "typeOfSetAside",
      params.setAsides.map(samSetAsideFilterCode).join(",")
    );
  }
  if (params.state) {
    url.searchParams.set("state", params.state);
  }

  return url;
}

/**
 * Search opportunities. Cached 5min.
 * Returns mapped Opportunity[] or throws on network/HTTP error.
 */
export async function searchOpportunities(
  params: SamSearchParams
): Promise<Opportunity[]> {
  const key = `sam:list:${hashKey(params)}`;
  const cached = cacheGet<Opportunity[]>(key);
  if (cached) return cached;

  const url = buildSamUrl(params);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SAM.gov ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { opportunitiesData?: unknown[] };
  const list = mapSamResponse(data.opportunitiesData ?? []);
  cacheSet(key, list, TTL.SAM_LIST);
  return list;
}

/**
 * Fetch a single opportunity by noticeId. Cached 1hr.
 */
export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const key = `sam:detail:${id}`;
  const cached = cacheGet<Opportunity | null>(key);
  if (cached !== undefined) return cached;

  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) throw new Error("SAM_API_KEY env var is not set");

  const url = new URL(SAM_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("noticeid", id);
  url.searchParams.set("limit", "1");

  // SAM.gov requires postedFrom/postedTo even for noticeid lookups.
  // Max range is "less than 1 year"; 365 days is rejected with
  // "Date range must be 1 year(s) apart". 364 satisfies it.
  const today = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 364);
  url.searchParams.set("postedFrom", fmtDate(from));
  url.searchParams.set("postedTo", fmtDate(today));

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SAM.gov ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { opportunitiesData?: unknown[] };
  const list = mapSamResponse(data.opportunitiesData ?? []);
  const opp = list[0] ?? null;
  if (opp) await resolveDescription(opp);
  cacheSet(key, opp, TTL.SAM_DETAIL);
  return opp;
}

/**
 * SAM.gov returns `description` on the search endpoint as a URL pointer,
 * not the inline text. Resolve it to the actual body so downstream AI
 * prompts get real content. Best-effort — sets description to null on
 * failure so the UI can show a graceful fallback instead of a raw URL.
 */
async function resolveDescription(opp: Opportunity): Promise<void> {
  const desc = opp.description;
  if (!desc || !desc.startsWith("http")) return;
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) { opp.description = undefined; return; }
  try {
    const url = new URL(desc);
    if (!url.searchParams.has("api_key")) {
      url.searchParams.set("api_key", apiKey);
    }
    const res = await fetch(url, {
      headers: { Accept: "application/json, text/html, */*" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { opp.description = undefined; return; }
    const text = await res.text();

    // SAM sometimes returns JSON { description: "..." }
    try {
      const parsed = JSON.parse(text) as { description?: string };
      if (parsed?.description) {
        opp.description = parsed.description;
        return;
      }
    } catch { /* not JSON */ }

    // SAM often returns HTML — strip tags to plain text
    if (text.startsWith("<")) {
      const stripped = text
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
      if (stripped.length > 80) {
        opp.description = stripped;
        return;
      }
    } else if (text.length > 0) {
      opp.description = text;
      return;
    }

    // Could not extract useful text — clear the URL so the UI knows
    opp.description = undefined;
  } catch {
    opp.description = undefined;
  }
}

// ─── Mapper ────────────────────────────────────────────────────────────────

type RawSam = {
  noticeId?: string;
  title?: string;
  solicitationNumber?: string;
  fullParentPathName?: string;
  department?: string;
  subTier?: string;
  office?: string;
  naicsCode?: string;
  classificationCode?: string;
  type?: string;
  typeOfSetAsideDescription?: string;
  typeOfSetAside?: string;
  postedDate?: string;
  responseDeadLine?: string;
  awardCeiling?: number | string;
  awardFloor?: number | string;
  award?: { amount?: number };
  description?: string;
  uiLink?: string;
  links?: Array<{ rel?: string; href?: string }>;
  placeOfPerformance?: {
    city?: { name?: string } | string;
    state?: { name?: string; code?: string } | string;
    zip?: string;
    country?: { name?: string; code?: string } | string;
  };
};

function asString(x: unknown): string | undefined {
  if (typeof x === "string") return x;
  if (x && typeof x === "object" && "name" in x && typeof (x as { name: unknown }).name === "string") {
    return (x as { name: string }).name;
  }
  if (x && typeof x === "object" && "code" in x && typeof (x as { code: unknown }).code === "string") {
    return (x as { code: string }).code;
  }
  return undefined;
}

// SAM.gov returns placeOfPerformance.state as either an object {name,code}
// or a bare string — and the bare string is the FULL state name, not the
// 2-letter code. Normalize so downstream match scoring + filtering works
// against STATE_CENTROIDS and Profile.state (which are 2-letter).
const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY",
};

function normalizeState(x: unknown): string | undefined {
  // Object form: prefer the 2-letter code if present, else map the name.
  if (x && typeof x === "object") {
    const obj = x as { code?: unknown; name?: unknown };
    if (typeof obj.code === "string" && obj.code.length === 2) {
      return obj.code.toUpperCase();
    }
    if (typeof obj.name === "string") {
      return STATE_NAME_TO_CODE[obj.name.toLowerCase()] ?? obj.name;
    }
  }
  if (typeof x === "string") {
    if (x.length === 2) return x.toUpperCase();
    return STATE_NAME_TO_CODE[x.toLowerCase()] ?? x;
  }
  return undefined;
}

function asNumber(x: unknown): number | undefined {
  if (typeof x === "number") return x;
  if (typeof x === "string" && x.trim()) {
    const n = Number(x.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function mapSamResponse(raw: unknown[]): Opportunity[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = r as RawSam;
    const department = o.department ?? deriveDepartment(o.fullParentPathName);
    const subTier = o.subTier ?? deriveSubTier(o.fullParentPathName);
    const setAsideRaw = o.typeOfSetAsideDescription ?? o.typeOfSetAside;
    const setAside = normalizeSamSetAside(setAsideRaw);

    const awardCeiling = asNumber(o.awardCeiling);
    const awardFloor = asNumber(o.awardFloor);
    const direct = o.award?.amount;
    const estimatedValue =
      direct ?? (awardCeiling && awardFloor ? (awardCeiling + awardFloor) / 2 : awardCeiling ?? awardFloor);

    const pop = o.placeOfPerformance ?? {};
    const opp: Opportunity = {
      id: o.noticeId ?? hashKey(o),
      title: o.title ?? "Untitled opportunity",
      solicitationNumber: o.solicitationNumber,
      department,
      subTier,
      office: o.office,
      naicsCode: o.naicsCode,
      classificationCode: o.classificationCode,
      setAside,
      setAsideRaw: setAsideRaw ?? undefined,
      type: o.type,
      postedDate: o.postedDate,
      responseDeadLine: o.responseDeadLine,
      awardCeiling,
      awardFloor,
      estimatedValue,
      description: o.description,
      placeOfPerformance: {
        city: asString(pop.city),
        state: normalizeState(pop.state),
        zip: pop.zip,
        country: asString(pop.country),
      },
      uiLink:
        o.uiLink ??
        o.links?.find((l) => l.rel === "uiLink" || l.href?.includes("sam.gov/opp"))?.href ??
        (o.noticeId ? `https://sam.gov/opp/${o.noticeId}/view` : undefined),
    };
    return opp;
  });
}

function deriveDepartment(path?: string): string | undefined {
  if (!path) return undefined;
  return path.split(/[.>]/)[0]?.trim();
}
function deriveSubTier(path?: string): string | undefined {
  if (!path) return undefined;
  const parts = path.split(/[.>]/).map((p) => p.trim()).filter(Boolean);
  return parts[1];
}
