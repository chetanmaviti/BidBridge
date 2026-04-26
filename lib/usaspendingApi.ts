import type { AwardWinner, SetAsideCode } from "./types";
import { TTL, cacheGet, cacheSet, hashKey } from "./cache";
import { usaspendingSetAsideCodes } from "./setAsides";

const USA_BASE = "https://api.usaspending.gov/api/v2/search/spending_by_award/";

export type UsaSpendingFilters = {
  naics: string;
  subTierAgency?: string;
  setAside?: SetAsideCode | null;
  valueRange?: { lower: number; upper: number };
  monthsBack?: number; // default 24
};

const FIELDS = [
  "Award ID",
  "Recipient Name",
  "Recipient UEI",
  "Award Amount",
  "Period of Performance Start Date",
  "Period of Performance Current End Date",
  "Set-Aside Type",
  "recipient_business_categories",
  "recipient_location_state_code",
  "Description",
  "Awarding Sub Agency",
] as const;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildBody(f: UsaSpendingFilters): Record<string, unknown> {
  const monthsBack = f.monthsBack ?? 24;
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - monthsBack);

  const filters: Record<string, unknown> = {
    award_type_codes: ["A", "B", "C", "D"],
    naics_codes: [f.naics],
    time_period: [{ start_date: isoDate(start), end_date: isoDate(end) }],
  };
  if (f.subTierAgency) {
    filters.agencies = [
      { type: "awarding", tier: "subtier", name: f.subTierAgency },
    ];
  }
  if (f.setAside) {
    filters.set_aside_type_codes = usaspendingSetAsideCodes(f.setAside);
  }
  if (f.valueRange) {
    filters.award_amounts = [
      { lower_bound: f.valueRange.lower, upper_bound: f.valueRange.upper },
    ];
  }
  return {
    filters,
    fields: FIELDS,
    page: 1,
    limit: 100,
    sort: "Award Amount",
    order: "desc",
  };
}

type RawAward = {
  "Award ID"?: string;
  generated_internal_id?: string;
  "Recipient Name"?: string;
  "Recipient UEI"?: string;
  "Award Amount"?: number | string;
  "Period of Performance Start Date"?: string;
  "Period of Performance Current End Date"?: string;
  "Set-Aside Type"?: string;
  recipient_business_categories?: string[];
  recipient_location_state_code?: string;
  Description?: string;
  "Awarding Sub Agency"?: string;
};

function mapAward(r: RawAward): AwardWinner {
  const amount =
    typeof r["Award Amount"] === "number"
      ? r["Award Amount"]
      : Number(String(r["Award Amount"] ?? 0).replace(/[^\d.-]/g, ""));
  return {
    id: r["Award ID"] ?? r.generated_internal_id ?? hashKey(r),
    recipientName: r["Recipient Name"] ?? "Unknown recipient",
    recipientUei: r["Recipient UEI"],
    amount: Number.isFinite(amount) ? amount : 0,
    startDate: r["Period of Performance Start Date"],
    endDate: r["Period of Performance Current End Date"],
    setAsideType: r["Set-Aside Type"] ?? undefined,
    businessCategories: r.recipient_business_categories,
    state: r.recipient_location_state_code,
  };
}

/**
 * Single call to USAspending spending_by_award.
 * Cached 24hr keyed by filter hash.
 */
export async function spendingByAward(
  f: UsaSpendingFilters
): Promise<AwardWinner[]> {
  const key = `usaspending:${hashKey(f)}`;
  const cached = cacheGet<AwardWinner[]>(key);
  if (cached) return cached;

  const body = buildBody(f);
  const res = await fetch(USA_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`USAspending ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as { results?: RawAward[] };
  const list = (data.results ?? []).map(mapAward);
  cacheSet(key, list, TTL.USA_SPENDING);
  return list;
}
