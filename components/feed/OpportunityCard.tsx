"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AgencyBadge } from "@/components/shared/AgencyBadge";
import { cleanSnippet, formatMoneyRange, locationLabel } from "@/lib/format";
import type { MatchResult, Opportunity } from "@/lib/types";
import { DeadlineBadge } from "./DeadlineBadge";
import { MatchScore } from "./MatchScore";
import { SetAsideBadge } from "./SetAsideBadge";

export function OpportunityCard({
  opportunity,
  match,
  summary,
  saved,
  onToggleSaved,
}: {
  opportunity: Opportunity;
  match: MatchResult;
  summary?: string;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-border bg-surface transition-all hover:border-border-bright hover:shadow-lg hover:shadow-black/30"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <AgencyBadge opportunity={opportunity} />
              <SetAsideBadge code={opportunity.setAside} />
              <DeadlineBadge date={opportunity.responseDeadLine} />
            </div>
            {/* Title */}
            <Link href={`/opportunity/${opportunity.id}`}>
              <h2 className="mt-3 text-base font-semibold leading-snug text-ink transition-colors hover:text-accent">
                {opportunity.title}
              </h2>
            </Link>
            {/* Summary */}
            <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-2">
              {summary || cleanSnippet(opportunity.description, 200)}
            </p>
          </div>
          {/* Match score */}
          <MatchScore score={match.score} />
        </div>

        {/* Metrics strip */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border bg-bg/50 px-4 py-3">
          <Meta label="Value" value={formatMoneyRange(opportunity)} />
          <Meta label="Location" value={locationLabel(opportunity)} />
          <Meta label="NAICS" value={opportunity.naicsCode ?? "TBD"} mono />
        </div>

        {/* Match reasons */}
        {match.reasons.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-md border border-border bg-bg px-2.5 py-1 text-xs text-ink-muted"
              >
                {reason}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <Link
          href={`/opportunity/${opportunity.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-all hover:gap-2.5"
        >
          View & Draft
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onToggleSaved}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition-all hover:border-border-bright hover:text-ink"
        >
          {saved ? (
            <BookmarkCheck className="h-3.5 w-3.5 text-accent" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.article>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="label">{label}</p>
      <p
        className={`mt-0.5 truncate text-sm font-medium text-ink ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
