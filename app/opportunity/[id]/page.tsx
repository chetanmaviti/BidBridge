"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AwardIntelligence } from "@/components/opportunity/AwardIntelligence";
import { OpportunityHeader } from "@/components/opportunity/OpportunityHeader";
import { PlainSummary, type DetailSummary } from "@/components/opportunity/PlainSummary";
import { ProposalDraft } from "@/components/opportunity/ProposalDraft";
import { Logo } from "@/components/shared/Logo";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared/ToastProvider";
import { useProfile } from "@/context/ProfileContext";
import type { IntelligenceStats, Opportunity } from "@/lib/types";

export default function OpportunityPage({ params }: { params: { id: string } }) {
  const { profile, hydrated, capabilityStatement, savedIds, toggleSaved } = useProfile();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [summary, setSummary] = useState<DetailSummary | null>(null);
  const [stats, setStats] = useState<IntelligenceStats | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  const handleSummaryReady = useCallback((next: DetailSummary) => {
    setSummary(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingOpportunity(true);
      setLoadingStats(true);
      setError("");
      try {
        const detailPromise = fetch(`/api/opportunity/${params.id}`).then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return (await res.json()) as { opportunity: Opportunity };
        });

        const intelParams = new URLSearchParams();
        if (profile) {
          intelParams.set("state", profile.state);
          intelParams.set("isSmall", String(profile.isSmallBusiness));
          intelParams.set("revenueRange", profile.revenueRange);
          intelParams.set("categories", profile.qualifyingCategories.join(","));
        }
        const statsPromise = fetch(`/api/award-intelligence/${params.id}?${intelParams.toString()}`)
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return (await res.json()) as { stats?: IntelligenceStats | null };
          })
          .catch(() => ({ stats: null }));

        const [detail, intelligence] = await Promise.all([detailPromise, statsPromise]);
        if (!cancelled) {
          setOpportunity(detail.opportunity);
          setStats(intelligence.stats ?? null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load opportunity");
      } finally {
        if (!cancelled) {
          setLoadingOpportunity(false);
          setLoadingStats(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id, profile]);

  if (!hydrated || loadingOpportunity) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="border-b border-border bg-surface px-5 py-4">
          <Logo />
        </div>
        <div className="mx-auto max-w-7xl space-y-5 px-5 py-6">
          <div className="h-36 rounded-lg shimmer" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-96 rounded-lg shimmer" />
            <div className="h-96 rounded-lg shimmer" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className="min-h-screen bg-bg px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Opportunity could not be loaded"
            body={error || "The opportunity was not found."}
            action={
              <Link href="/feed" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg">
                Back to feed
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="border-b border-border bg-bg px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo />
          <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Feed
          </Link>
        </div>
      </div>
      <OpportunityHeader
        opportunity={opportunity}
        saved={savedIds.includes(opportunity.id)}
        onToggleSaved={() => {
          toggleSaved(opportunity);
          toast(savedIds.includes(opportunity.id) ? "Removed from pipeline" : "Saved to pipeline");
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl space-y-5 px-5 py-6"
      >
        {!profile ? (
          <EmptyState
            title="Profile needed for tailored drafting"
            body="You can read the opportunity, but proposal drafting and profile fit work best after onboarding."
            action={
              <Link href="/onboarding" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg">
                Create profile
              </Link>
            }
          />
        ) : null}
        <div className="grid gap-5 lg:grid-cols-2">
          <PlainSummary opportunity={opportunity} onReady={handleSummaryReady} />
          <ProposalDraft
            opportunity={opportunity}
            profile={profile}
            capabilityStatement={capabilityStatement}
            summary={summary}
          />
        </div>
        <AwardIntelligence
          stats={stats}
          loading={loadingStats}
          opportunity={opportunity}
          profile={profile}
        />
      </motion.div>
    </main>
  );
}
