"use client";

import Link from "next/link";
import { BookmarkX, ArrowRight } from "lucide-react";
import { DeadlineBadge } from "@/components/feed/DeadlineBadge";
import { SetAsideBadge } from "@/components/feed/SetAsideBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatMoneyRange } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function SavedOpportunities({
  saved,
  onToggleSaved,
}: {
  saved: Opportunity[];
  onToggleSaved: (opportunity: Opportunity) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Saved opportunities</h2>
        <span className="font-mono text-xs text-ink-muted">{saved.length}</span>
      </div>
      <div className="p-4">
        {!saved.length ? (
          <EmptyState
            title="No saved opportunities yet"
            body="Save opportunities from the feed to build your pipeline."
          />
        ) : (
          <div className="space-y-2">
            {saved.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-lg border border-border bg-bg/60 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      <SetAsideBadge code={opportunity.setAside} />
                      <DeadlineBadge date={opportunity.responseDeadLine} />
                    </div>
                    <Link
                      href={`/opportunity/${opportunity.id}`}
                      className="block text-sm font-medium text-ink transition-colors hover:text-accent line-clamp-1"
                    >
                      {opportunity.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {formatMoneyRange(opportunity)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      href={`/opportunity/${opportunity.id}`}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-ink-muted transition-all hover:border-border-bright hover:text-ink"
                      title="Open"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onToggleSaved(opportunity)}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-ink-muted transition-all hover:border-danger/40 hover:text-danger"
                      title="Remove"
                    >
                      <BookmarkX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
