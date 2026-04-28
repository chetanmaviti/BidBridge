"use client";

import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { AgencyBadge } from "@/components/shared/AgencyBadge";
import { DeadlineBadge } from "@/components/feed/DeadlineBadge";
import { SetAsideBadge } from "@/components/feed/SetAsideBadge";
import { formatMoneyRange, locationLabel } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function OpportunityHeader({
  opportunity,
  saved,
  onToggleSaved,
}: {
  opportunity: Opportunity;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-6">
        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <AgencyBadge opportunity={opportunity} />
          <SetAsideBadge code={opportunity.setAside} />
          <DeadlineBadge date={opportunity.responseDeadLine} />
        </div>

        {/* Title + actions */}
        <div className="mt-4 flex flex-wrap items-start gap-5 lg:flex-nowrap">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl">
              {opportunity.title}
            </h1>

            {/* Metadata row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {formatMoneyRange(opportunity) !== "—" && (
                <Stat label="Value" value={formatMoneyRange(opportunity)} />
              )}
              <Stat label="Location" value={locationLabel(opportunity)} />
              {opportunity.naicsCode && (
                <Stat label="NAICS" value={opportunity.naicsCode} mono />
              )}
              {opportunity.solicitationNumber && (
                <Stat label="Solicitation" value={opportunity.solicitationNumber} mono />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap gap-2">
            {opportunity.id.startsWith("MOCK-") ? (
              <span className="btn-ghost cursor-not-allowed opacity-40">
                SAM.gov
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            ) : (
              <a
                href={opportunity.uiLink ?? `https://sam.gov/opp/${opportunity.id}/view`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 text-xs"
              >
                Open on SAM.gov
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onToggleSaved}
              className="btn-ghost py-2 text-xs"
            >
              {saved ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="label">{label}</span>
      <span className={`text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
