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
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-12 w-32 rounded shimmer" />
          <div className="h-40 rounded-lg shimmer" />
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
              <Link href="/onboarding" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg">
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
      <header className="border-b border-border bg-bg px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo />
          <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Feed
          </Link>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl space-y-6 px-5 py-6"
      >
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-normal text-accent">Profile</p>
              <h1 className="mt-2 font-display text-3xl font-semibold">{profile.businessName}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">{profile.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-ink-muted">
                <span>NAICS {profile.naicsCodes.join(", ")}</span>
                <span>{profile.employees} employees</span>
                <span>{profile.city}, {profile.state}</span>
                <span>{profile.qualifyingCategories.join(", ")}</span>
              </div>
            </div>
            <Link
              href="/onboarding?prefill=true"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-ink transition-colors hover:bg-bg"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </Link>
          </div>
        </section>

        <ValuePipeline saved={savedOpportunities} />

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <CapabilityStatement
            businessName={profile.businessName}
            text={capabilityStatement}
            onChange={(value) => {
              setCapabilityStatement(value);
              toast("Capability statement saved", "info");
            }}
          />
          <div className="space-y-6">
            <SavedOpportunities
              saved={savedOpportunities}
              onToggleSaved={(opportunity) => {
                toggleSaved(opportunity);
                toast("Removed from pipeline");
              }}
            />
            <section className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-5 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h2 className="font-display text-xl font-semibold">Generated drafts</h2>
              </div>
              {!proposalEntries.length ? (
                <EmptyState title="No drafts yet" body="Open an opportunity and let Bid draft a response to cache it here." />
              ) : (
                <div className="space-y-3">
                  {proposalEntries.map(([key, proposal]) => (
                    <div key={key} className="rounded-lg border border-border bg-bg p-4">
                      <p className="font-mono text-xs text-ink-muted">
                        {proposal.variant ?? "base"} / {new Date(proposal.generatedAt).toLocaleString()}
                      </p>
                      <p className="mt-2 truncate text-sm font-medium text-ink">
                        Opportunity {proposal.opportunityId}
                      </p>
                      <div className="mt-3">
                        <PdfDownloadButton
                          title={`Proposal ${proposal.opportunityId}`}
                          text={proposal.text}
                          fileName={`${slugifyFileName(proposal.opportunityId)}-${proposal.variant ?? "draft"}.pdf`}
                          className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
