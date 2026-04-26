import type {
  AwardCohort,
  AwardWinner,
  IntelligenceStats,
  Opportunity,
  Profile,
  SetAsideCode,
} from "./types";
import { sameRegion } from "./geocode";
import { spendingByAward } from "./usaspendingApi";

// ─── Cohort building with progressive broadening (FRD §5.6) ───────────────

const MIN_COHORT = 10;

export async function buildCohort(opp: Opportunity): Promise<AwardCohort | null> {
  const naics = opp.naicsCode;
  if (!naics) return null;

  const subTier = opp.subTier;
  const setAside = opp.setAside ?? null;
  const value = opp.estimatedValue ?? opp.awardCeiling;
  const valueRange = value ? { lower: value * 0.5, upper: value * 2.0 } : undefined;

  // Step 1 — narrow query
  let awards = await spendingByAward({
    naics,
    subTierAgency: subTier,
    setAside,
    valueRange,
    monthsBack: 24,
  });
  if (awards.length >= MIN_COHORT) {
    return {
      awards,
      source: "narrow",
      filtersApplied: [
        `NAICS ${naics}`,
        subTier ? `Sub-agency: ${subTier}` : "",
        setAside ? `Set-aside: ${setAside}` : "",
        valueRange ? `Value $${k(valueRange.lower)}–$${k(valueRange.upper)}` : "",
        "Last 24 months",
      ].filter(Boolean),
    };
  }

  // Step 2 — drop value range
  awards = await spendingByAward({
    naics,
    subTierAgency: subTier,
    setAside,
    monthsBack: 24,
  });
  if (awards.length >= MIN_COHORT) {
    return {
      awards,
      source: "broadened-value",
      filtersApplied: [
        `NAICS ${naics}`,
        subTier ? `Sub-agency: ${subTier}` : "",
        setAside ? `Set-aside: ${setAside}` : "",
        "Value range broadened",
        "Last 24 months",
      ].filter(Boolean),
    };
  }

  // Step 3 — drop agency, keep NAICS + set-aside
  awards = await spendingByAward({
    naics,
    setAside,
    monthsBack: 24,
  });
  if (awards.length >= MIN_COHORT) {
    return {
      awards,
      source: "broadened-agency",
      filtersApplied: [
        `NAICS ${naics}`,
        setAside ? `Set-aside: ${setAside}` : "",
        "Sub-agency dropped",
        "Last 24 months",
      ].filter(Boolean),
    };
  }

  // Insufficient — return what we have so caller can flag insufficientData
  return {
    awards,
    source: "broadened-agency",
    filtersApplied: [`NAICS ${naics}`, "Insufficient data"],
  };
}

// ─── Statistics ────────────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

function quarterKey(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

function lastNQuarters(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.unshift(quarterKey(d));
    d.setMonth(d.getMonth() - 3);
  }
  return out;
}

export function computeStats(
  cohort: AwardCohort,
  profile: Profile
): IntelligenceStats {
  const awards = cohort.awards;
  const insufficientData = awards.length < MIN_COHORT;

  if (insufficientData) {
    return {
      insufficientData: true,
      cohortSize: awards.length,
      source: cohort.source,
      filtersApplied: cohort.filtersApplied,
      median: 0,
      p25: 0,
      p75: 0,
      velocity: lastNQuarters(8).map((quarter) => ({ quarter, count: 0 })),
      velocityTrend: { multiplier: 1, direction: "flat" },
      frequentWinners: [],
      recentAwards: [],
      profileFitPct: 0,
      similarWinnerCount: 0,
    };
  }

  // ─── Median / p25 / p75 ──────────────────────────────────────────────
  const amounts = awards.map((a) => a.amount).sort((a, b) => a - b);
  const median = percentile(amounts, 0.5);
  const p25 = percentile(amounts, 0.25);
  const p75 = percentile(amounts, 0.75);

  // ─── Velocity (8 quarters) ───────────────────────────────────────────
  const buckets: Record<string, number> = {};
  for (const q of lastNQuarters(8)) buckets[q] = 0;
  for (const a of awards) {
    if (!a.startDate) continue;
    const d = new Date(a.startDate);
    const k = quarterKey(d);
    if (k in buckets) buckets[k] += 1;
  }
  const velocity = Object.entries(buckets).map(([quarter, count]) => ({
    quarter,
    count,
  }));
  // First half vs second half multiplier for trend
  const half = Math.floor(velocity.length / 2);
  const firstHalf = velocity.slice(0, half).reduce((s, v) => s + v.count, 0) || 0.5;
  const secondHalf = velocity.slice(half).reduce((s, v) => s + v.count, 0) || 0.5;
  const multiplier = secondHalf / firstHalf;
  const direction: "up" | "down" | "flat" =
    multiplier > 1.25 ? "up" : multiplier < 0.8 ? "down" : "flat";
  const velocityTrend = { multiplier: Math.round(multiplier * 10) / 10, direction };

  // ─── Frequent winners (top 3 by count) ───────────────────────────────
  const winnerMap = new Map<string, { wins: number; total: number }>();
  for (const a of awards) {
    const w = winnerMap.get(a.recipientName) ?? { wins: 0, total: 0 };
    w.wins += 1;
    w.total += a.amount;
    winnerMap.set(a.recipientName, w);
  }
  const frequentWinners = Array.from(winnerMap.entries())
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 3)
    .map(([name, v]) => ({
      name,
      wins: v.wins,
      avgAward: Math.round(v.total / v.wins),
    }));

  // ─── Recent awards (most recent 5) ───────────────────────────────────
  const recentAwards = [...awards]
    .filter((a) => a.startDate)
    .sort(
      (a, b) =>
        new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime()
    )
    .slice(0, 5);

  // ─── Profile fit (similarity scoring per FRD §5.6) ───────────────────
  const similar = awards.filter((w) => similarityScore(w, profile) >= 0.5);
  const profileFitPct = Math.round((similar.length / awards.length) * 100);

  return {
    insufficientData: false,
    cohortSize: awards.length,
    source: cohort.source,
    filtersApplied: cohort.filtersApplied,
    median: Math.round(median),
    p25: Math.round(p25),
    p75: Math.round(p75),
    velocity,
    velocityTrend,
    frequentWinners,
    recentAwards,
    profileFitPct,
    similarWinnerCount: similar.length,
  };
}

// ─── Similarity scoring (FRD §5.6) ─────────────────────────────────────────

const REVENUE_BANDS: Record<string, [number, number]> = {
  "under-100k": [0, 100_000],
  "100k-500k": [100_000, 500_000],
  "500k-1m": [500_000, 1_000_000],
  "1m-5m": [1_000_000, 5_000_000],
  "5m-10m": [5_000_000, 10_000_000],
  "10m-50m": [10_000_000, 50_000_000],
  "over-50m": [50_000_000, Infinity],
};

const CATEGORY_TO_SETASIDE: Record<string, SetAsideCode> = {
  women_owned_business: "WOSB",
  woman_owned_business: "WOSB",
  woman_owned_small_business: "WOSB",
  economically_disadvantaged_women_owned_small_business: "EDWOSB",
  veteran_owned_business: "VOSB",
  service_disabled_veteran_owned_business: "SDVOSB",
  hubzone_program: "HZC",
  "8a_program": "8A",
  small_business: "SBA",
};

function winnerCategories(w: AwardWinner): SetAsideCode[] {
  if (!w.businessCategories) return [];
  const out: SetAsideCode[] = [];
  for (const c of w.businessCategories) {
    const k = c.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const m = CATEGORY_TO_SETASIDE[k];
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}

function intersect<T>(a: T[], b: T[]): T[] {
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}

export function similarityScore(winner: AwardWinner, user: Profile): number {
  let score = 0;
  let total = 0;

  // Size standard alignment (weight 1.0) — assume cohort winners are small
  // since they were awarded under set-asides; use user.isSmallBusiness as proxy
  total += 1;
  if (user.isSmallBusiness) score += 1;

  // Set-aside category overlap (weight 1.5)
  total += 1.5;
  const wCats = winnerCategories(winner);
  const uCats = user.qualifyingCategories;
  if (uCats.length) {
    const overlap = intersect(wCats, uCats).length;
    if (overlap > 0) score += 1.5 * (overlap / uCats.length);
  }

  // Geographic match (weight 1.0)
  total += 1;
  if (winner.state && user.state) {
    if (winner.state === user.state) score += 1;
    else if (sameRegion(winner.state, user.state)) score += 0.5;
  }

  // Award size band (weight 0.5)
  total += 0.5;
  const band = REVENUE_BANDS[user.revenueRange];
  if (band && winner.amount >= band[0] / 10 && winner.amount <= band[1] * 10) {
    score += 0.5;
  }

  return total === 0 ? 0 : score / total;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function k(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}K` : `${Math.round(n)}`;
}
