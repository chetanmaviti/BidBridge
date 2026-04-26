"use client";

import { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { StreamingText } from "@/components/shared/StreamingText";
import { streamGeneratedText } from "@/lib/clientStreaming";
import type { IntelligenceStats, Opportunity, Profile } from "@/lib/types";

export function StrategicRecommendations({
  stats,
  opportunity,
  profile,
}: {
  stats: IntelligenceStats;
  opportunity: Opportunity;
  profile: Profile | null;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const input = useMemo(
    () => JSON.stringify({ stats, opportunity, profile }, null, 2),
    [opportunity, profile, stats]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        await streamGeneratedText({
          task: "award-intel-recs",
          input,
          onChunk: (_chunk, fullText) => {
            if (!cancelled) setText(fullText);
          },
        });
      } catch {
        if (!cancelled) {
          setText(`- Price near the ${formatNumber(stats.median)} median and explain any premium or discount clearly.
- Emphasize the set-aside and small-business qualifications that match this cohort.
- Review frequent winners as likely competitors or possible teaming partners.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [input, stats.median]);

  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent" />
        <p className="font-display text-lg font-semibold">Strategic recommendations</p>
      </div>
      <StreamingText text={text} loading={loading} placeholder="Recommendations will appear after the cohort is analyzed." />
    </div>
  );
}

function formatNumber(n: number) {
  return n ? `$${Math.round(n).toLocaleString()}` : "cohort";
}
