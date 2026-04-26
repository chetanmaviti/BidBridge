import type { Opportunity } from "./types";

export function formatMoney(value?: number | null): string {
  if (!value || !Number.isFinite(value)) return "Value TBD";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatMoneyRange(opp: Opportunity): string {
  if (opp.awardFloor && opp.awardCeiling) {
    return `${formatMoney(opp.awardFloor)}-${formatMoney(opp.awardCeiling)}`;
  }
  return formatMoney(opp.estimatedValue ?? opp.awardCeiling ?? opp.awardFloor);
}

export function fullAgency(opp: Opportunity): string {
  return [opp.department, opp.subTier].filter(Boolean).join(" / ") || "Federal agency";
}

export function locationLabel(opp: Opportunity): string {
  const pop = opp.placeOfPerformance;
  if (!pop) return "Location TBD";
  return [pop.city, pop.state].filter(Boolean).join(", ") || pop.country || "Location TBD";
}

export function daysUntil(date?: string): number | null {
  if (!date) return null;
  const target = new Date(date).getTime();
  if (!Number.isFinite(target)) return null;
  const diff = target - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(date?: string): string {
  const days = daysUntil(date);
  if (days === null) return "Deadline TBD";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

export function cleanSnippet(text?: string, max = 220): string {
  const t = (text ?? "")
    .replace(/\s+/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00b7/g, "/")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, "")}...`;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function slugifyFileName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "document";
}
