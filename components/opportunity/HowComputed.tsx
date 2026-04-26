import type { IntelligenceStats, Opportunity } from "@/lib/types";

export function HowComputed({
  stats,
  opportunity,
}: {
  stats: IntelligenceStats;
  opportunity: Opportunity;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink">How this is computed</p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
        We pulled {stats.cohortSize} contracts awarded under {opportunity.naicsCode ? `NAICS ${opportunity.naicsCode}` : "this NAICS category"} in the last 24 months. The cards above aggregate award amounts, award timing, recipient concentration, and the share of past winners whose profile resembles yours.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {stats.filtersApplied.map((filter) => (
          <span key={filter} className="rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-ink-muted">
            {filter}
          </span>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-ink-muted">Source: USAspending.gov / official federal data</p>
    </div>
  );
}
