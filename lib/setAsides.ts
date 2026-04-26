import type { OwnershipFlag, Profile, SetAsideCode, SetAsideDef } from "./types";

export const SET_ASIDE_CATALOG: Record<SetAsideCode, SetAsideDef> = {
  WOSB: {
    code: "WOSB",
    label: "Women-Owned Small Business",
    shortLabel: "WOSB",
    color: "#a78bfa",
    description: "≥51% owned and controlled by women.",
  },
  EDWOSB: {
    code: "EDWOSB",
    label: "Economically Disadvantaged Women-Owned Small Business",
    shortLabel: "EDWOSB",
    color: "#c084fc",
    description: "WOSB whose owners meet economic-disadvantage criteria.",
  },
  SDVOSB: {
    code: "SDVOSB",
    label: "Service-Disabled Veteran-Owned Small Business",
    shortLabel: "SDVOSB",
    color: "#60a5fa",
    description: "≥51% owned by service-disabled veterans.",
  },
  VOSB: {
    code: "VOSB",
    label: "Veteran-Owned Small Business",
    shortLabel: "VOSB",
    color: "#38bdf8",
    description: "≥51% owned and controlled by veterans.",
  },
  HZC: {
    code: "HZC",
    label: "HUBZone Small Business",
    shortLabel: "HUBZone",
    color: "#3ddc84",
    description: "Located in a Historically Underutilized Business Zone.",
  },
  "8A": {
    code: "8A",
    label: "8(a) Business Development Program",
    shortLabel: "8(a)",
    color: "#fb923c",
    description: "Socially and economically disadvantaged firms in SBA's 8(a) program.",
  },
  SBA: {
    code: "SBA",
    label: "Small Business Set-Aside",
    shortLabel: "SBA",
    color: "#facc15",
    description: "Reserved for any firm meeting the small business size standard.",
  },
};

export const ALL_SET_ASIDES: SetAsideCode[] = [
  "WOSB",
  "EDWOSB",
  "SDVOSB",
  "VOSB",
  "HZC",
  "8A",
  "SBA",
];

/**
 * Map ownership flags + HUBZone + small-business status →
 * the set of set-aside codes the user qualifies for.
 */
export function qualifyingCategories(
  ownership: OwnershipFlag[],
  inHubZone: boolean,
  isSmall: boolean
): SetAsideCode[] {
  const result: SetAsideCode[] = [];
  if (isSmall) result.push("SBA");
  if (isSmall && ownership.includes("woman-owned")) result.push("WOSB");
  if (
    isSmall &&
    ownership.includes("woman-owned") &&
    ownership.includes("disadvantaged")
  )
    result.push("EDWOSB");
  if (isSmall && ownership.includes("veteran-owned")) result.push("VOSB");
  if (isSmall && ownership.includes("service-disabled-veteran-owned"))
    result.push("SDVOSB");
  if (isSmall && inHubZone) result.push("HZC");
  if (isSmall && ownership.includes("disadvantaged")) result.push("8A");
  return result;
}

export function userQualifies(
  profile: Pick<Profile, "qualifyingCategories">,
  code: SetAsideCode
): boolean {
  return profile.qualifyingCategories.includes(code);
}

/**
 * Normalize SAM.gov's typeOfSetAsideDescription / typeOfSetAside to our codes.
 */
export function normalizeSamSetAside(raw: string | undefined | null): SetAsideCode | null {
  if (!raw) return null;
  const r = raw.toUpperCase();
  if (r.includes("WOMEN") && r.includes("ECONOMICALLY")) return "EDWOSB";
  if (r.includes("EDWOSB")) return "EDWOSB";
  if (r.includes("WOMEN") || r.includes("WOSB")) return "WOSB";
  if (r.includes("SERVICE-DISABLED") || r.includes("SDVOSB")) return "SDVOSB";
  if (r.includes("VETERAN") || r.includes("VOSB")) return "VOSB";
  if (r.includes("HUBZONE") || r === "HZC") return "HZC";
  if (r.includes("8(A)") || r === "8A" || r.includes("8 A")) return "8A";
  if (r.includes("TOTAL SMALL BUSINESS") || r === "SBA" || r.includes("SET-ASIDE")) return "SBA";
  return null;
}

/**
 * SAM.gov filter codes for the typeOfSetAside query parameter.
 * (Per FRD §6.)
 */
export function samSetAsideFilterCode(code: SetAsideCode): string {
  switch (code) {
    case "WOSB": return "WOSB";
    case "EDWOSB": return "EDWOSB";
    case "SDVOSB": return "SDVOSBC";
    case "VOSB": return "VSA";
    case "HZC": return "HZC";
    case "8A": return "8A";
    case "SBA": return "SBA";
  }
}

/**
 * USAspending set_aside_type_codes mapping.
 */
export function usaspendingSetAsideCodes(code: SetAsideCode): string[] {
  switch (code) {
    case "WOSB": return ["WOSB", "WOSBSS"];
    case "EDWOSB": return ["EDWOSB", "EDWOSBSS"];
    case "SDVOSB": return ["SDVOSBC", "SDVOSBS"];
    case "VOSB": return ["VSA", "VSS"];
    case "HZC": return ["HZC", "HZS"];
    case "8A": return ["8A", "8AN"];
    case "SBA": return ["SBA"];
  }
}
