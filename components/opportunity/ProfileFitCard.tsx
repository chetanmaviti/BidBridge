import type { IntelligenceStats } from "@/lib/types";

export function ProfileFitCard({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink-muted">Profile fit</p>
      <p className="mt-3 font-mono text-4xl font-semibold text-ink tabular">
        {stats.profileFitPct}%
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {stats.similarWinnerCount} of {stats.cohortSize} past winners matched your profile.
      </p>
    </div>
  );
}
