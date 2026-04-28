import type { IntelligenceStats, Opportunity } from "@/lib/types";

export function HowComputed({
  stats,
  opportunity,
}: {
  stats: IntelligenceStats;
  opportunity: Opportunity;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/60 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <p className="label mb-1.5">How this is computed</p>
          <p className="max-w-3xl text-xs leading-relaxed text-ink-muted">
            Pulled {stats.cohortSize} contracts awarded under{" "}
            {opportunity.naicsCode
              ? `NAICS ${opportunity.naicsCode}`
              : "this NAICS category"}{" "}
            in the last 24 months. Cards aggregate award amounts, timing, recipient
            concentration, and profile similarity to past winners.
          </p>
        </div>
        <p className="font-mono text-[10px] text-ink-dim">USAspending.gov</p>
      </div>
      {stats.filtersApplied.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stats.filtersApplied.map((filter) => (
            <span
              key={filter}
              className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-muted"
            >
              {filter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
