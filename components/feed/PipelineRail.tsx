import Link from "next/link";
import { BookmarkCheck, BriefcaseBusiness } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function PipelineRail({ saved }: { saved: Opportunity[] }) {
  const total = saved.reduce((sum, opp) => sum + (opp.estimatedValue ?? opp.awardCeiling ?? 0), 0);
  const bySetAside = saved.reduce<Record<string, number>>((acc, opp) => {
    const key = opp.setAside ?? "Open";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="sticky top-32 hidden h-fit space-y-4 lg:block">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-accent" />
          <h2 className="font-display text-lg font-semibold">Your pipeline</h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded border border-border bg-bg p-3">
            <p className="font-mono text-[11px] uppercase tracking-normal text-ink-muted">Saved</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink tabular">{saved.length}</p>
          </div>
          <div className="rounded border border-border bg-bg p-3">
            <p className="font-mono text-[11px] uppercase tracking-normal text-ink-muted">Value</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-accent tabular">{formatMoney(total)}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {Object.entries(bySetAside).map(([label, count]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">{label}</span>
              <span className="font-mono text-ink">{count}</span>
            </div>
          ))}
        </div>
        <Link
          href="/profile"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-ink transition-colors hover:bg-bg"
        >
          <BookmarkCheck className="h-4 w-4" />
          Open profile
        </Link>
      </div>
    </aside>
  );
}
