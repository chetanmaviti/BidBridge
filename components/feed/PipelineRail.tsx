import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function PipelineRail({ saved }: { saved: Opportunity[] }) {
  const total = saved.reduce(
    (sum, opp) => sum + (opp.estimatedValue ?? opp.awardCeiling ?? 0),
    0
  );
  const bySetAside = saved.reduce<Record<string, number>>((acc, opp) => {
    const key = opp.setAside ?? "Open";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="sticky top-[88px] hidden h-fit lg:block">
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Your pipeline</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-surface p-4">
            <p className="label">Saved</p>
            <p className="mt-1.5 font-mono text-3xl font-semibold text-ink tabular">
              {saved.length}
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="label">Pipeline</p>
            <p className="mt-1.5 font-mono text-3xl font-semibold text-accent tabular">
              {formatMoney(total)}
            </p>
          </div>
        </div>

        {/* By set-aside */}
        {Object.keys(bySetAside).length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="label mb-2">By type</p>
            <div className="space-y-1.5">
              {Object.entries(bySetAside).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{label}</span>
                  <span className="font-mono text-xs text-ink">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved titles preview */}
        {saved.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="label mb-2">Recent</p>
            <div className="space-y-1.5">
              {saved.slice(0, 3).map((opp) => (
                <Link
                  key={opp.id}
                  href={`/opportunity/${opp.id}`}
                  className="block truncate text-xs text-ink-muted transition-colors hover:text-ink"
                >
                  {opp.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Link to profile */}
        <div className="border-t border-border p-3">
          <Link
            href="/profile"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-2 text-xs font-medium text-ink-muted transition-all hover:border-border-bright hover:text-ink"
          >
            Full pipeline
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
