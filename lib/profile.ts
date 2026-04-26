import type { Opportunity, Profile } from "./types";

const KEYS = {
  profile: "bid:profile",
  saved: "bid:savedOpportunities",
  proposals: "bid:proposals",
  capability: "bid:capabilityStatement",
} as const;

const isClient = () => typeof window !== "undefined";

// ─── Profile ────────────────────────────────────────────────────────────────

export function loadProfile(): Profile | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(KEYS.profile);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile | null): void {
  if (!isClient()) return;
  if (profile === null) {
    localStorage.removeItem(KEYS.profile);
    return;
  }
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

// ─── Saved opportunities ───────────────────────────────────────────────────

export function loadSavedOpportunities(): Opportunity[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEYS.saved);
    return raw ? (JSON.parse(raw) as Opportunity[]) : [];
  } catch {
    return [];
  }
}

export function toggleSavedOpportunity(opp: Opportunity): Opportunity[] {
  if (!isClient()) return [];
  const list = loadSavedOpportunities();
  const exists = list.find((o) => o.id === opp.id);
  const next = exists ? list.filter((o) => o.id !== opp.id) : [...list, opp];
  localStorage.setItem(KEYS.saved, JSON.stringify(next));
  return next;
}

export function isOpportunitySaved(id: string): boolean {
  return loadSavedOpportunities().some((o) => o.id === id);
}

// ─── Proposals (cached drafts) ─────────────────────────────────────────────

export type CachedProposal = {
  opportunityId: string;
  text: string;
  variant?: string;
  generatedAt: string;
};

export function loadProposals(): Record<string, CachedProposal> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(KEYS.proposals);
    return raw ? (JSON.parse(raw) as Record<string, CachedProposal>) : {};
  } catch {
    return {};
  }
}

export function cacheProposal(p: CachedProposal): void {
  if (!isClient()) return;
  const all = loadProposals();
  const key = p.variant ? `${p.opportunityId}::${p.variant}` : p.opportunityId;
  all[key] = p;
  localStorage.setItem(KEYS.proposals, JSON.stringify(all));
}

export function loadProposal(
  opportunityId: string,
  variant?: string
): CachedProposal | undefined {
  const all = loadProposals();
  const key = variant ? `${opportunityId}::${variant}` : opportunityId;
  return all[key];
}

// ─── Capability statement ──────────────────────────────────────────────────

export function loadCapabilityStatement(): string {
  if (!isClient()) return "";
  return localStorage.getItem(KEYS.capability) ?? "";
}

export function saveCapabilityStatement(text: string): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.capability, text);
}
