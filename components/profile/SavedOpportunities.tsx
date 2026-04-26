"use client";

import Link from "next/link";
import { BookmarkX, ExternalLink } from "lucide-react";
import { DeadlineBadge } from "@/components/feed/DeadlineBadge";
import { SetAsideBadge } from "@/components/feed/SetAsideBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatMoneyRange, locationLabel } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function SavedOpportunities({
  saved,
  onToggleSaved,
}: {
  saved: Opportunity[];
  onToggleSaved: (opportunity: Opportunity) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Saved opportunities</h2>
      </div>
      {!saved.length ? (
        <EmptyState title="No saved opportunities yet" body="Save opportunities from the feed to build a working pipeline." />
      ) : (
        <div className="space-y-3">
          {saved.map((opportunity) => (
            <article key={opportunity.id} className="rounded-lg border border-border bg-bg p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <SetAsideBadge code={opportunity.setAside} />
                    <DeadlineBadge date={opportunity.responseDeadLine} />
                  </div>
                  <Link
                    href={`/opportunity/${opportunity.id}`}
                    className="font-display text-lg font-semibold text-ink hover:text-accent"
                  >
                    {opportunity.title}
                  </Link>
                  <p className="mt-2 text-sm text-ink-muted">
                    {formatMoneyRange(opportunity)} / {locationLabel(opportunity)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/opportunity/${opportunity.id}`}
                    className="grid h-10 w-10 place-items-center rounded-md border border-border text-ink-muted hover:text-ink"
                    title="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleSaved(opportunity)}
                    className="grid h-10 w-10 place-items-center rounded-md border border-border text-ink-muted hover:text-danger"
                    title="Remove"
                  >
                    <BookmarkX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
