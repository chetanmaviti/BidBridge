"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, FileText } from "lucide-react";
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
      whileHover={{ y: -3 }}
      className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AgencyBadge opportunity={opportunity} />
            <SetAsideBadge code={opportunity.setAside} />
            <DeadlineBadge date={opportunity.responseDeadLine} />
          </div>
          <Link href={`/opportunity/${opportunity.id}`}>
            <h2 className="mt-4 font-display text-xl font-semibold leading-tight text-ink transition-colors hover:text-accent">
              {opportunity.title}
            </h2>
          </Link>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            {summary || cleanSnippet(opportunity.description, 240)}
          </p>
        </div>
        <MatchScore score={match.score} />
      </div>

      <div className="mt-5 grid gap-3 border-y border-border py-4 md:grid-cols-3">
        <Meta label="Value" value={formatMoneyRange(opportunity)} />
        <Meta label="Location" value={locationLabel(opportunity)} />
        <Meta label="NAICS" value={opportunity.naicsCode ?? "TBD"} />
      </div>

      {match.reasons.length ? (
        <ul className="mt-4 grid gap-2 text-sm text-ink-muted md:grid-cols-3">
          {match.reasons.map((reason) => (
            <li key={reason} className="rounded border border-border bg-bg px-3 py-2">
              {reason}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/opportunity/${opportunity.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          <FileText className="h-4 w-4" />
          Draft Response
        </Link>
        <button
          type="button"
          onClick={onToggleSaved}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-normal text-ink-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
