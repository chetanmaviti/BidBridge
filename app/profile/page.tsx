"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { CapabilityStatement } from "@/components/profile/CapabilityStatement";
import { SavedOpportunities } from "@/components/profile/SavedOpportunities";
import { ValuePipeline } from "@/components/profile/ValuePipeline";
import { Logo } from "@/components/shared/Logo";
import { EmptyState } from "@/components/shared/EmptyState";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { useToast } from "@/components/shared/ToastProvider";
import { useProfile } from "@/context/ProfileContext";
import { slugifyFileName } from "@/lib/format";
import { type CachedProposal, loadProposals } from "@/lib/profile";

export default function ProfilePage() {
  const {
    profile,
    hydrated,
    capabilityStatement,
    setCapabilityStatement,
    savedOpportunities,
    toggleSaved,
  } = useProfile();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Record<string, CachedProposal>>({});

  useEffect(() => {
    setProposals(loadProposals());
  }, []);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-bg px-5 py-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-10 w-36 rounded-lg shimmer" />
          <div className="h-36 rounded-xl shimmer" />
          <div className="h-64 rounded-xl shimmer" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-bg px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="No business profile yet"
            body="Create a profile to save opportunities, draft responses, and generate a capability statement."
            action={
              <Link href="/onboarding" className="btn-primary">
                Start onboarding
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const proposalEntries = Object.entries(proposals);

  return (
    <main className="min-h-screen bg-bg">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/95 px-5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo />
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to feed
          </Link>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-7xl space-y-4 px-5 py-6"
      >
        {/* Business card */}
        <section className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <p className="label text-accent mb-1">Business profile</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {profile.businessName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                {profile.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Chip label="NAICS" value={profile.naicsCodes.join(", ")} mono />
                <Chip label="Employees" value={String(profile.employees)} />
                <Chip label="Location" value={`${profile.city}, ${profile.state}`} />
                {profile.qualifyingCategories.length > 0 && (
                  <Chip label="Set-asides" value={profile.qualifyingCategories.join(", ")} />
                )}
              </div>
            </div>
            <Link href="/onboarding?prefill=true" className="btn-ghost py-2 text-xs">
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Link>
          </div>
        </section>

        <ValuePipeline saved={savedOpportunities} />

        <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
          <CapabilityStatement
            businessName={profile.businessName}
            text={capabilityStatement}
            onChange={(value) => {
              setCapabilityStatement(value);
              toast("Capability statement saved", "info");
            }}
          />
          <div className="space-y-4">
            <SavedOpportunities
              saved={savedOpportunities}
              onToggleSaved={(opportunity) => {
                toggleSaved(opportunity);
                toast("Removed from pipeline");
              }}
            />

            {/* Generated drafts */}
            <section className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                <FileText className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-ink">Generated drafts</h2>
              </div>
              <div className="p-4">
                {!proposalEntries.length ? (
                  <EmptyState
                    title="No drafts yet"
                    body="Open an opportunity and let BidBridge draft a response — it will be cached here."
                  />
                ) : (
                  <div className="space-y-2">
                    {proposalEntries.map(([key, proposal]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="label">{proposal.variant ?? "base"}</p>
                          <p className="mt-0.5 truncate text-sm text-ink">
                            Opportunity {proposal.opportunityId}
                          </p>
                          <p className="font-mono text-[11px] text-ink-muted">
                            {new Date(proposal.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <PdfDownloadButton
                          title={`Proposal ${proposal.opportunityId}`}
                          text={proposal.text}
                          fileName={`${slugifyFileName(proposal.opportunityId)}-${proposal.variant ?? "draft"}.pdf`}
                          className="btn-ghost py-1.5 text-xs shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function Chip({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg/50 px-3 py-1.5">
      <p className="label">{label}</p>
      <p className={`mt-0.5 text-sm font-medium text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
