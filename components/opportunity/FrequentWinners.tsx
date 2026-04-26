import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function FrequentWinners({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink-muted">Frequent winners</p>
      <ol className="mt-4 space-y-3">
        {stats.frequentWinners.map((winner, index) => (
          <li key={winner.name} className="grid grid-cols-[24px_1fr] gap-3">
            <span className="font-mono text-sm text-accent">{index + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{winner.name}</p>
              <p className="font-mono text-xs text-ink-muted">
                {winner.wins} wins / avg {formatMoney(winner.avgAward)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
