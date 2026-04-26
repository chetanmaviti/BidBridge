import type { Opportunity } from "./types";

const CACHE_KEY = "bid:opportunityCache";
const MAX_ITEMS = 100;
const MAX_AGE_MS = 1000 * 60 * 60 * 24;

type CachedOpportunity = {
  opportunity: Opportunity;
  cachedAt: number;
};

const isClient = () => typeof window !== "undefined";

function readCache(): Record<string, CachedOpportunity> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CachedOpportunity>) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CachedOpportunity>): void {
  if (!isClient()) return;
  const now = Date.now();
  const freshEntries = Object.entries(cache)
    .filter(([, record]) => now - record.cachedAt <= MAX_AGE_MS)
    .sort((a, b) => b[1].cachedAt - a[1].cachedAt)
    .slice(0, MAX_ITEMS);

  localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(freshEntries)));
}

export function cacheOpportunity(opportunity: Opportunity): void {
  if (!isClient()) return;
  const cache = readCache();
  cache[opportunity.id] = { opportunity, cachedAt: Date.now() };
  writeCache(cache);
}

export function cacheOpportunities(opportunities: Opportunity[]): void {
  if (!isClient() || !opportunities.length) return;
  const cache = readCache();
  const now = Date.now();
  for (const opportunity of opportunities) {
    cache[opportunity.id] = { opportunity, cachedAt: now };
  }
  writeCache(cache);
}

export function loadCachedOpportunity(id: string): Opportunity | null {
  if (!isClient()) return null;
  const cache = readCache();
  const record = cache[id];
  if (!record) return null;
  if (Date.now() - record.cachedAt > MAX_AGE_MS) {
    delete cache[id];
    writeCache(cache);
    return null;
  }
  return record.opportunity;
}
