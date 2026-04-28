import type { IntelligenceStats } from "@/lib/types";

export function ProfileFitCard({ stats }: { stats: IntelligenceStats }) {
  const pct = stats.profileFitPct;
  const color = pct >= 70 ? "text-accent" : pct >= 40 ? "text-warn" : "text-ink-muted";
  return (
    <div className="rounded-xl border border-border bg-bg/60 p-4">
      <p className="label">Profile fit</p>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular ${color}`}>
        {pct}%
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
        {stats.similarWinnerCount} of {stats.cohortSize} past winners matched your profile.
      </p>
    </div>
  );
}
