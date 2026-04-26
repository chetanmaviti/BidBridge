import type { MatchResult, Opportunity, Profile } from "./types";
import { STATE_CENTROIDS, haversineMiles, sameRegion } from "./geocode";
import { findNaics } from "./naicsCatalog";

/**
 * Deterministic 0-100 match score per FRD §5.5.
 * Buckets: NAICS overlap (40), set-aside qualification (25),
 *          size standard fit (15), geographic proximity (10),
 *          capability statement keyword overlap (10).
 */
export function match(
  profile: Profile,
  opp: Opportunity,
  capabilityStatement = ""
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // ─── 1. NAICS overlap (40 max) ──────────────────────────────────────────
  const oppNaics = opp.naicsCode;
  if (oppNaics) {
    if (profile.naicsCodes.includes(oppNaics)) {
      score += 40;
      const def = findNaics(oppNaics);
      reasons.push(`NAICS ${oppNaics}${def ? ` (${def.title})` : ""} matches exactly`);
    } else if (
      profile.naicsCodes.some((c) => c.slice(0, 3) === oppNaics.slice(0, 3))
    ) {
      score += 25;
      reasons.push(`NAICS industry group ${oppNaics.slice(0, 3)}xxx matches`);
    }
  }

  // ─── 2. Set-aside qualification (25) ────────────────────────────────────
  if (opp.setAside) {
    if (profile.qualifyingCategories.includes(opp.setAside)) {
      score += 25;
      reasons.push(`Reserved for ${opp.setAside} — you qualify`);
    }
  } else {
    score += 10;
    reasons.push("Open to all small businesses");
  }

  // ─── 3. Size standard fit (15) ──────────────────────────────────────────
  if (oppNaics && profile.isSmallBusiness) {
    score += 15;
  }

  // ─── 4. Geographic proximity (10) ───────────────────────────────────────
  const popState = opp.placeOfPerformance?.state;
  const userCoords = profile.coords;
  if (userCoords && popState && STATE_CENTROIDS[popState]) {
    const dist = haversineMiles(userCoords, STATE_CENTROIDS[popState]);
    if (dist < 50) {
      score += 10;
      reasons.push(`${Math.round(dist)} miles from your HQ`);
    } else if (dist < 250) {
      score += 6;
      reasons.push(`${Math.round(dist)} miles from your HQ`);
    } else if (dist < 1000) {
      score += 2;
    }
  } else if (popState && popState === profile.state) {
    score += 10;
    reasons.push(`Performance in your state (${popState})`);
  } else if (popState && sameRegion(popState, profile.state)) {
    score += 6;
    reasons.push(`Performance in your region`);
  }

  // ─── 5. Capability statement Jaccard (10) ───────────────────────────────
  if (capabilityStatement && opp.description) {
    const j = jaccard(tokens(capabilityStatement), tokens(opp.description));
    score += Math.round(j * 10);
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: reasons.slice(0, 3),
  };
}

// ─── Tokenization helpers ──────────────────────────────────────────────────

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "for", "on", "with",
  "by", "as", "at", "is", "are", "was", "were", "be", "been", "being", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "this", "that", "these", "those", "it", "its", "they", "their", "them",
  "we", "our", "us", "you", "your", "i", "my", "me", "shall", "must", "can",
  "from", "into", "than", "then", "if", "any", "all", "no", "not", "such",
  "which", "who", "whom", "what", "when", "where", "how", "why",
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
