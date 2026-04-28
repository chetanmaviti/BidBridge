import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function FrequentWinners({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="rounded-xl border border-border bg-bg/60 p-4">
      <p className="label">Frequent winners</p>
      <ol className="mt-3 space-y-2.5">
        {stats.frequentWinners.map((winner, index) => (
          <li key={winner.name} className="grid grid-cols-[18px_1fr] items-start gap-2.5">
            <span className="font-mono text-xs text-accent">{index + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink">{winner.name}</p>
              <p className="font-mono text-[10px] text-ink-muted">
                {winner.wins}× · avg {formatMoney(winner.avgAward)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
