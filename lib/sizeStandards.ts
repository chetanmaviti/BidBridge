import type { Profile } from "./types";

/**
 * SBA Size Standards (subset matching lib/naicsCatalog.ts).
 *
 * Each NAICS has either an employee cap OR a revenue cap (in USD).
 * Source: SBA Table of Small Business Size Standards (2023-2024 updates).
 *
 * Defaults applied:
 *   - Manufacturing & wholesale: employees
 *   - Professional services: revenue
 *   - Construction: revenue
 */
type SizeStandard =
  | { naics: string; employeeCap: number }
  | { naics: string; revenueCap: number };

export const SIZE_STANDARDS: SizeStandard[] = [
  // Manufacturing — employee-based
  { naics: "322220", employeeCap: 500 },
  { naics: "323111", employeeCap: 500 },
  { naics: "323113", employeeCap: 500 },
  { naics: "311999", employeeCap: 500 },
  { naics: "311941", employeeCap: 750 },
  { naics: "332710", employeeCap: 500 },
  { naics: "333318", employeeCap: 1000 },
  { naics: "339999", employeeCap: 500 },
  { naics: "315240", employeeCap: 750 },

  // Construction — revenue-based
  { naics: "236220", revenueCap: 45_000_000 },
  { naics: "237110", revenueCap: 45_000_000 },
  { naics: "237310", revenueCap: 45_000_000 },
  { naics: "238210", revenueCap: 19_000_000 },
  { naics: "238220", revenueCap: 19_000_000 },
  { naics: "238110", revenueCap: 19_000_000 },

  // IT services — revenue-based
  { naics: "541511", revenueCap: 34_000_000 },
  { naics: "541512", revenueCap: 34_000_000 },
  { naics: "541513", revenueCap: 34_000_000 },
  { naics: "541519", revenueCap: 34_000_000 },
  { naics: "518210", revenueCap: 40_000_000 },
  { naics: "541690", revenueCap: 19_000_000 },

  // Consulting / professional services — revenue-based
  { naics: "541611", revenueCap: 24_500_000 },
  { naics: "541612", revenueCap: 19_000_000 },
  { naics: "541613", revenueCap: 19_000_000 },
  { naics: "541618", revenueCap: 19_000_000 },
  { naics: "541620", revenueCap: 19_000_000 },
  { naics: "541330", revenueCap: 25_500_000 },
  { naics: "541310", revenueCap: 12_500_000 },
  { naics: "541211", revenueCap: 26_500_000 },
  { naics: "541219", revenueCap: 22_500_000 },
  { naics: "541810", revenueCap: 25_500_000 },
  { naics: "541910", revenueCap: 30_000_000 },
  { naics: "541715", employeeCap: 1000 },
  { naics: "541990", revenueCap: 19_500_000 },

  // Facilities / staffing — revenue-based
  { naics: "561110", revenueCap: 12_500_000 },
  { naics: "561210", revenueCap: 47_000_000 },
  { naics: "561320", revenueCap: 34_000_000 },
  { naics: "561612", revenueCap: 25_000_000 },
  { naics: "561720", revenueCap: 22_000_000 },
  { naics: "561730", revenueCap: 9_500_000 },
  { naics: "561790", revenueCap: 9_500_000 },
  { naics: "562111", revenueCap: 47_000_000 },
  { naics: "561990", revenueCap: 16_500_000 },

  // Wholesale — employee-based
  { naics: "423430", employeeCap: 250 },
  { naics: "423610", employeeCap: 200 },
  { naics: "423990", employeeCap: 200 },

  // Transportation — revenue-based
  { naics: "484110", revenueCap: 34_000_000 },
  { naics: "484121", revenueCap: 34_000_000 },
  { naics: "488510", revenueCap: 22_000_000 },
  { naics: "493110", revenueCap: 34_000_000 },

  // Healthcare — revenue-based
  { naics: "621399", revenueCap: 9_000_000 },
  { naics: "621610", revenueCap: 19_000_000 },
];

const REVENUE_RANGE_TO_USD: Record<string, number> = {
  "under-100k": 100_000,
  "100k-500k": 500_000,
  "500k-1m": 1_000_000,
  "1m-5m": 5_000_000,
  "5m-10m": 10_000_000,
  "10m-50m": 50_000_000,
  "over-50m": 100_000_000,
};

export function findSizeStandard(naicsCode: string): SizeStandard | undefined {
  return SIZE_STANDARDS.find((s) => s.naics === naicsCode);
}

export function isSmallBusiness(
  profile: Pick<Profile, "employees" | "revenueRange">,
  naicsCode: string
): boolean {
  const std = findSizeStandard(naicsCode);
  if (!std) return true; // unknown NAICS — assume small (lenient default)
  if ("employeeCap" in std) {
    return profile.employees <= std.employeeCap;
  }
  const usd = REVENUE_RANGE_TO_USD[profile.revenueRange] ?? 0;
  return usd <= std.revenueCap;
}

export function isSmallForAnyNaics(
  profile: Pick<Profile, "employees" | "revenueRange">,
  naicsCodes: string[]
): boolean {
  return naicsCodes.some((c) => isSmallBusiness(profile, c));
}
