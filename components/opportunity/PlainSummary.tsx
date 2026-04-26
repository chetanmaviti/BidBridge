"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import type { Opportunity } from "@/lib/types";

export type DetailSummary = {
  summary: string;
  evaluationFactors: Array<{ factor: string; weight: string }>;
  requiredAttachments: string[];
  keyRequirements: string[];
};

export function PlainSummary({
  opportunity,
  onReady,
}: {
  opportunity: Opportunity;
  onReady: (summary: DetailSummary) => void;
}) {
  const [summary, setSummary] = useState<DetailSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/gemini/structured", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: "summarize-detail",
            input: JSON.stringify({
              title: opportunity.title,
              agency: [opportunity.department, opportunity.subTier].filter(Boolean).join(" / "),
              description: opportunity.description,
            }),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { result?: DetailSummary };
        const result = data.result ?? fallbackSummary(opportunity);
        if (!cancelled) {
          setSummary(result);
          onReady(result);
        }
      } catch {
        const result = fallbackSummary(opportunity);
        if (!cancelled) {
          setSummary(result);
          setError("Gemini detail summary is unavailable, so the solicitation text is summarized locally.");
          onReady(result);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [onReady, opportunity]);

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-5 flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-accent" />
        <h2 className="font-display text-xl font-semibold">What the agency wants</h2>
      </div>
      {loading && !summary ? (
        <div className="space-y-3">
          <div className="h-4 w-5/6 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-2/3 rounded shimmer" />
        </div>
      ) : null}
      {summary ? (
        <div className="space-y-5">
          {error ? <p className="text-sm text-warn">{error}</p> : null}
          <div className="whitespace-pre-line text-sm leading-6 text-ink-muted">
            {summary.summary}
          </div>
          <InfoList
            title="Evaluation factors"
            items={summary.evaluationFactors.map((f) => `${f.factor} (${f.weight})`)}
          />
          <InfoList title="Required attachments" items={summary.requiredAttachments} />
          <InfoList title="Key requirements" items={summary.keyRequirements} />
        </div>
      ) : null}
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-normal text-ink">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-ink-muted">
        {items.map((item) => (
          <li key={item} className="rounded border border-border bg-bg px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function fallbackSummary(opportunity: Opportunity): DetailSummary {
  const text = opportunity.description?.slice(0, 700) || opportunity.title;
  return {
    summary: text,
    evaluationFactors: [
      { factor: "Technical approach", weight: "Important" },
      { factor: "Past performance", weight: "Important" },
      { factor: "Price", weight: "Important" },
    ],
    requiredAttachments: ["Technical response", "Pricing", "Capability statement"],
    keyRequirements: [
      opportunity.setAside ? `Set-aside: ${opportunity.setAside}` : "Confirm eligibility requirements",
      opportunity.responseDeadLine ? `Submit before ${opportunity.responseDeadLine}` : "Confirm response deadline",
    ],
  };
}
