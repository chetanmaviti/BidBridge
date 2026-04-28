import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function MedianAwardCard({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="rounded-xl border border-border bg-bg/60 p-4">
      <p className="label">Median award</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-accent tabular">
        {formatMoney(stats.median)}
      </p>
      <p className="mt-1.5 font-mono text-xs text-ink-muted">
        {formatMoney(stats.p25)} – {formatMoney(stats.p75)} range
      </p>
      <p className="mt-3 text-xs text-ink-muted">
        From {stats.cohortSize} comparable awards
      </p>
    </div>
  );
}
