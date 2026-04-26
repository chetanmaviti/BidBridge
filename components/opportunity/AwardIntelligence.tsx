import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { IntelligenceStats, Opportunity, Profile } from "@/lib/types";
import { FrequentWinners } from "./FrequentWinners";
import { HowComputed } from "./HowComputed";
import { MedianAwardCard } from "./MedianAwardCard";
import { ProfileFitCard } from "./ProfileFitCard";
import { RecentAwardsTable } from "./RecentAwardsTable";
import { StrategicRecommendations } from "./StrategicRecommendations";
import { VelocitySparkline } from "./VelocitySparkline";

export function AwardIntelligence({
  stats,
  loading,
  opportunity,
  profile,
}: {
  stats: IntelligenceStats | null;
  loading: boolean;
  opportunity: Opportunity;
  profile: Profile | null;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-accent" />
        <h2 className="font-display text-2xl font-semibold">Award Intelligence</h2>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 rounded-lg shimmer" />
          ))}
        </div>
      ) : null}
      {!loading && (!stats || stats.insufficientData) ? (
        <EmptyState
          title="Not enough award data yet"
          body="The cohort had fewer than 10 comparable awards after broadening. Bid will not fabricate intelligence when the official data is too thin."
        />
      ) : null}
      {!loading && stats && !stats.insufficientData ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MedianAwardCard stats={stats} />
            <VelocitySparkline stats={stats} />
            <ProfileFitCard stats={stats} />
            <FrequentWinners stats={stats} />
          </div>
          <HowComputed stats={stats} opportunity={opportunity} />
          <StrategicRecommendations stats={stats} opportunity={opportunity} profile={profile} />
          <RecentAwardsTable stats={stats} />
        </div>
      ) : null}
    </section>
  );
}
