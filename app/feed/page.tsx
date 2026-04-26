"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Info } from "lucide-react";
import { FeedHeader } from "@/components/feed/FeedHeader";
import type { FeedFilter } from "@/components/feed/FilterChips";
import { OpportunityCard } from "@/components/feed/OpportunityCard";
import { PipelineRail } from "@/components/feed/PipelineRail";
import { SkeletonCard } from "@/components/feed/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared/ToastProvider";
import { useProfile } from "@/context/ProfileContext";
import { streamGeneratedText } from "@/lib/clientStreaming";
import { cleanSnippet, daysUntil, fullAgency } from "@/lib/format";
import { STATE_CENTROIDS, haversineMiles } from "@/lib/geo";
import { cacheOpportunities } from "@/lib/opportunityCache";
import { match } from "@/lib/ranking";
import type { MatchResult, Opportunity } from "@/lib/types";

type ScoredOpportunity = {
  opportunity: Opportunity;
  match: MatchResult;
};

export default function FeedPage() {
  const { profile, hydrated, capabilityStatement, savedIds, savedOpportunities, toggleSaved } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fallbackReason, setFallbackReason] = useState("");
  const [broadened, setBroadened] = useState<string[]>([]);
  const [emptyMatch, setEmptyMatch] = useState(false);
  const [items, setItems] = useState<ScoredOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const summaryStarted = useRef(new Set<string>());
  const showingBroaderSamResults = broadened.includes("naics");

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      setLoading(false);
      return;
    }
    const activeProfile = profile;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setFallbackReason("");
      setBroadened([]);
      setEmptyMatch(false);
      try {
        const params = new URLSearchParams();
        params.set("naics", activeProfile.naicsCodes.join(","));
        params.set("state", activeProfile.state);
        params.set("setAside", activeProfile.qualifyingCategories.join(","));
        params.set("limit", "30");
        const res = await fetch(`/api/opportunities?${params.toString()}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as {
          opportunities: Opportunity[];
          fallback?: boolean;
          empty?: boolean;
          broadened?: string[];
          reason?: string;
        };
        const scored = data.opportunities
          .map((opportunity) => ({
            opportunity,
            match: match(activeProfile, opportunity, capabilityStatement),
          }))
          .sort((a, b) => {
            if (b.match.score !== a.match.score) return b.match.score - a.match.score;
            return deadlineTime(a.opportunity) - deadlineTime(b.opportunity);
          })
          .slice(0, 25);
        if (!cancelled) {
          cacheOpportunities(data.opportunities);
          setItems(scored);
          if (data.fallback) setFallbackReason(data.reason ?? "Live SAM.gov data unavailable");
          if (data.broadened?.length) setBroadened(data.broadened);
          if (data.empty) setEmptyMatch(true);
        }
      } catch (error) {
        if (!cancelled) {
          setFallbackReason(error instanceof Error ? error.message : "Could not load opportunities");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, profile, capabilityStatement]);

  useEffect(() => {
    const top = items.slice(0, 12).map((item) => item.opportunity);
    if (!top.length) return;
    let cancelled = false;
    let cursor = 0;

    async function worker() {
      while (!cancelled && cursor < top.length) {
        const opportunity = top[cursor++];
        if (!opportunity || summaryStarted.current.has(opportunity.id)) continue;
        summaryStarted.current.add(opportunity.id);
        try {
          const text = await streamGeneratedText({
            task: "summarize-card",
            input: JSON.stringify({
              title: opportunity.title,
              agency: fullAgency(opportunity),
              description: opportunity.description,
            }),
          });
          if (!cancelled && text.trim()) {
            setSummaries((current) => ({ ...current, [opportunity.id]: text.trim() }));
          }
        } catch {
          if (!cancelled) {
            setSummaries((current) => ({
              ...current,
              [opportunity.id]: cleanSnippet(opportunity.description, 180),
            }));
          }
        }
      }
    }

    void Promise.all([worker(), worker(), worker()]);
    return () => {
      cancelled = true;
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(({ opportunity }) => {
      if (q) {
        const haystack = [
          opportunity.title,
          fullAgency(opportunity),
          opportunity.naicsCode,
          opportunity.setAside,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filter === "under-250k") {
        const value = opportunity.estimatedValue ?? opportunity.awardCeiling ?? 0;
        return value > 0 && value <= 250_000;
      }
      if (filter === "set-aside") return Boolean(opportunity.setAside);
      if (filter === "closing-soon") {
        const days = daysUntil(opportunity.responseDeadLine);
        return days !== null && days >= 0 && days <= 7;
      }
      if (filter === "nearby") return profile ? isNearby(profile, opportunity) : false;
      return true;
    });
  }, [filter, items, profile, search]);

  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-bg">
        <FeedHeader search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} />
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-bg px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Create a profile to rank opportunities"
            body="Bid needs NAICS codes, size status, and set-aside qualifications before it can score federal opportunities."
            action={
              <Link
                href="/onboarding"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg"
              >
                Start onboarding
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <FeedHeader search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} />
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">
                {showingBroaderSamResults ? "Broader SAM.gov opportunities" : "Matched opportunities"}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {showingBroaderSamResults
                  ? `No active NAICS match was found, so these are broader live SAM.gov opportunities ranked for ${profile.businessName}.`
                  : `Ranked for ${profile.businessName} using NAICS ${profile.naicsCodes.join(", ")}.`}
              </p>
            </div>
            {fallbackReason ? (
              <div className="inline-flex items-center gap-2 rounded border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
                <AlertCircle className="h-4 w-4" />
                Fallback feed active
              </div>
            ) : showingBroaderSamResults ? (
              <div className="inline-flex items-center gap-2 rounded border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
                <Info className="h-3.5 w-3.5" />
                Showing other SAM.gov results
              </div>
            ) : broadened.length && !emptyMatch ? (
              <div className="inline-flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-xs text-ink-muted">
                <Info className="h-3.5 w-3.5" />
                Broadened: dropped {broadened.join(" + ")}
              </div>
            ) : null}
          </div>

          {emptyMatch ? (
            <EmptyState
              title="No live federal opportunities for your NAICS"
              body={`SAM.gov is up, but no active solicitations were returned for NAICS ${profile.naicsCodes.join(", ")} or the broader live SAM.gov search. Try editing your profile and adding additional NAICS codes that overlap with what you sell.`}
              action={
                <Link
                  href="/onboarding?prefill=true"
                  className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg"
                >
                  Edit profile
                </Link>
              }
            />
          ) : filtered.length ? (
            <motion.div layout className="space-y-4">
              {filtered.map(({ opportunity, match }) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  match={match}
                  summary={summaries[opportunity.id]}
                  saved={savedIds.includes(opportunity.id)}
                  onToggleSaved={() => {
                    toggleSaved(opportunity);
                    toast(
                      savedIds.includes(opportunity.id)
                        ? "Removed from pipeline"
                        : "Saved to pipeline"
                    );
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No opportunities match these filters"
              body="Try a broader filter or search term."
            />
          )}
        </section>
        <PipelineRail saved={savedOpportunities} />
      </div>
    </main>
  );
}

function deadlineTime(opp: Opportunity): number {
  if (!opp.responseDeadLine) return Number.MAX_SAFE_INTEGER;
  const t = new Date(opp.responseDeadLine).getTime();
  return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
}

function isNearby(
  profile: { coords?: { lat: number; lng: number }; state: string },
  opportunity: Opportunity
): boolean {
  const popState = opportunity.placeOfPerformance?.state;
  if (!popState) return false;
  if (profile.coords && STATE_CENTROIDS[popState]) {
    return haversineMiles(profile.coords, STATE_CENTROIDS[popState]) <= 100;
  }
  return popState === profile.state;
}
