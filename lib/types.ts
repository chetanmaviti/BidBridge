// ─── Profile ────────────────────────────────────────────────────────────────

export type RevenueRange =
  | "under-100k"
  | "100k-500k"
  | "500k-1m"
  | "1m-5m"
  | "5m-10m"
  | "10m-50m"
  | "over-50m";

export type OwnershipFlag =
  | "woman-owned"
  | "veteran-owned"
  | "service-disabled-veteran-owned"
  | "disadvantaged"
  | "minority-owned"
  | "lgbt-owned";

export type SetAsideCode =
  | "WOSB"
  | "EDWOSB"
  | "SDVOSB"
  | "VOSB"
  | "HZC"
  | "8A"
  | "SBA";

export type Profile = {
  businessName: string;
  dba?: string;
  yearFounded: number;
  employees: number;
  revenueRange: RevenueRange;
  address: string;
  city: string;
  state: string;
  zip: string;
  website?: string;
  description: string;
  naicsCodes: string[];
  ownership: OwnershipFlag[];
  inHubZone: boolean;
  hubZoneExpiresOn?: string;
  isSmallBusiness: boolean;
  qualifyingCategories: SetAsideCode[];
  coords?: { lat: number; lng: number };
  createdAt: string;
};

// ─── Opportunity ───────────────────────────────────────────────────────────

export type Opportunity = {
  id: string;                    // SAM noticeId
  title: string;
  solicitationNumber?: string;
  department?: string;           // top-level agency
  subTier?: string;              // sub-agency / office
  office?: string;
  naicsCode?: string;
  classificationCode?: string;   // PSC
  setAside?: SetAsideCode | null;
  setAsideRaw?: string;          // raw string from SAM in case of unknown codes
  type?: string;                 // ptype: o, k, etc.
  postedDate?: string;
  responseDeadLine?: string;     // ISO
  awardCeiling?: number;
  awardFloor?: number;
  estimatedValue?: number;
  description?: string;          // full text body
  placeOfPerformance?: {
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  uiLink?: string;               // sam.gov/opp/{id}/view
  rawUrl?: string;
};

// ─── Match score ───────────────────────────────────────────────────────────

export type MatchResult = {
  score: number;                 // 0-100
  reasons: string[];
};

// ─── Award Intelligence ────────────────────────────────────────────────────

export type AwardWinner = {
  id: string;
  recipientName: string;
  recipientUei?: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  setAsideType?: string;
  businessCategories?: string[];
  state?: string;
};

export type AwardCohort = {
  awards: AwardWinner[];
  source: "narrow" | "broadened-value" | "broadened-agency" | "broadened-setaside";
  filtersApplied: string[];
};

export type IntelligenceStats = {
  insufficientData: boolean;
  cohortSize: number;
  source: AwardCohort["source"];
  filtersApplied: string[];
  median: number;
  p25: number;
  p75: number;
  velocity: { quarter: string; count: number }[];
  velocityTrend: { multiplier: number; direction: "up" | "down" | "flat" };
  frequentWinners: { name: string; wins: number; avgAward: number }[];
  recentAwards: AwardWinner[];
  profileFitPct: number;
  similarWinnerCount: number;
};

// ─── NAICS catalog ─────────────────────────────────────────────────────────

export type NaicsCode = {
  code: string;
  title: string;
  description: string;
};

// ─── Set-aside catalog ─────────────────────────────────────────────────────

export type SetAsideDef = {
  code: SetAsideCode;
  label: string;
  shortLabel: string;
  color: string;       // tailwind hex for chip
  description: string;
};
