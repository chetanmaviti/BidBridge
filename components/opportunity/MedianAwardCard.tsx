import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function MedianAwardCard({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink-muted">Median award</p>
      <p className="mt-3 font-mono text-4xl font-semibold text-accent tabular">
        {formatMoney(stats.median)}
      </p>
      <p className="mt-2 font-mono text-sm text-ink-muted">
        {formatMoney(stats.p25)}-{formatMoney(stats.p75)} middle range
      </p>
      <p className="mt-4 text-sm text-ink-muted">From {stats.cohortSize} past awards</p>
    </div>
  );
}
