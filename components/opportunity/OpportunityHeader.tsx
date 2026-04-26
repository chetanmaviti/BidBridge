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
      <div className="mx-auto max-w-7xl px-5 py-7">
        <div className="flex flex-wrap items-center gap-2">
          <AgencyBadge opportunity={opportunity} />
          <SetAsideBadge code={opportunity.setAside} />
          <DeadlineBadge date={opportunity.responseDeadLine} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-normal text-ink md:text-4xl">
              {opportunity.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
              <span>{formatMoneyRange(opportunity)}</span>
              <span>{locationLabel(opportunity)}</span>
              {opportunity.naicsCode ? <span>NAICS {opportunity.naicsCode}</span> : null}
              {opportunity.solicitationNumber ? <span>{opportunity.solicitationNumber}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={opportunity.uiLink ?? `https://sam.gov/opp/${opportunity.id}/view`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Open on SAM.gov
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onToggleSaved}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg"
            >
              {saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
