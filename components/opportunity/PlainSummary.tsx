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
    if (opportunity.description?.startsWith("http")) return;

    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const descriptionText = opportunity.description?.trim()
          ? opportunity.description
          : `Title: ${opportunity.title}. Agency: ${[opportunity.department, opportunity.subTier].filter(Boolean).join(" / ")}. NAICS: ${opportunity.naicsCode ?? "not specified"}. Estimated value: ${opportunity.estimatedValue ? `$${opportunity.estimatedValue.toLocaleString()}` : "not specified"}. Set-aside: ${opportunity.setAside ?? "open competition"}.`;

        const res = await fetch("/api/gemini/structured", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: "summarize-detail",
            input: JSON.stringify({
              title: opportunity.title,
              agency: [opportunity.department, opportunity.subTier]
                .filter(Boolean)
                .join(" / "),
              description: descriptionText,
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
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <ListChecks className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-ink">What the agency wants</h2>
      </div>

      <div className="p-5">
        {loading && !summary ? (
          <div className="space-y-2.5">
            <div className="h-3.5 w-5/6 rounded-md shimmer" />
            <div className="h-3.5 w-full rounded-md shimmer" />
            <div className="h-3.5 w-4/6 rounded-md shimmer" />
            <div className="h-3.5 w-5/6 rounded-md shimmer" />
          </div>
        ) : null}

        {summary ? (
          <div className="space-y-5">
            {error ? <p className="text-xs text-warn">{error}</p> : null}
            <p className="text-sm leading-relaxed text-ink-muted">{summary.summary}</p>

            <InfoList
              title="Evaluation factors"
              items={summary.evaluationFactors.map((f) => `${f.factor} · ${f.weight}`)}
            />
            <InfoList title="Required attachments" items={summary.requiredAttachments} />
            <InfoList title="Key requirements" items={summary.keyRequirements} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="label mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-ink-muted"
          >
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
      opportunity.setAside
        ? `Set-aside: ${opportunity.setAside}`
        : "Confirm eligibility requirements",
      opportunity.responseDeadLine
        ? `Submit before ${opportunity.responseDeadLine}`
        : "Confirm response deadline",
    ],
  };
}
