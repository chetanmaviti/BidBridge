"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { StreamingText } from "@/components/shared/StreamingText";
import { streamGeneratedText } from "@/lib/clientStreaming";
import { formatMoneyRange, slugifyFileName, wordCount } from "@/lib/format";
import { cacheProposal, loadProposal } from "@/lib/profile";
import type { Opportunity, Profile } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import type { DetailSummary } from "./PlainSummary";
import { VariantSwitcher, type ProposalVariant } from "./VariantSwitcher";

export function ProposalDraft({
  opportunity,
  profile,
  capabilityStatement,
  summary,
}: {
  opportunity: Opportunity;
  profile: Profile | null;
  capabilityStatement: string;
  summary: DetailSummary | null;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<ProposalVariant | undefined>();
  const [error, setError] = useState("");

  const input = useMemo(
    () =>
      JSON.stringify(
        {
          profile,
          opportunity: {
            ...opportunity,
            valueRange: formatMoneyRange(opportunity),
          },
          capabilityStatement,
          summary,
        },
        null,
        2
      ),
    [capabilityStatement, opportunity, profile, summary]
  );

  const generate = useCallback(
    async (selectedVariant?: ProposalVariant) => {
      if (!profile || !summary) return;
      setLoading(true);
      setError("");
      setVariant(selectedVariant);
      setText("");
      try {
        const cached = loadProposal(opportunity.id, selectedVariant);
        if (cached?.text) {
          setText(cached.text);
          return;
        }
        const full = await streamGeneratedText({
          task: selectedVariant ? "proposal-variant" : "draft-proposal",
          variant: selectedVariant,
          input,
          onChunk: (_chunk, fullText) => setText(fullText),
        });
        cacheProposal({
          opportunityId: opportunity.id,
          text: full,
          variant: selectedVariant,
          generatedAt: new Date().toISOString(),
        });
      } catch {
        const fallback = fallbackProposal(profile, opportunity);
        setText(fallback);
      } finally {
        setLoading(false);
      }
    },
    [input, opportunity, profile, summary]
  );

  useEffect(() => {
    if (!profile || !summary) return;
    void generate(undefined);
  }, [generate, profile, summary]);

  const words = wordCount(text);
  const pages = Math.max(1, Math.ceil(words / 500));

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <FileText className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-ink">Your drafted response</h2>
      </div>

      <div className="p-5">
        <VariantSwitcher active={variant} onSelect={(v) => generate(v)} disabled={loading || !text} />

        {error ? <p className="mt-3 text-xs text-warn">{error}</p> : null}

        <div className="mt-4 min-h-72 rounded-lg border border-border bg-bg/60 p-4">
          <StreamingText
            text={text}
            loading={loading}
            placeholder="The proposal will start once the summary is ready."
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="label">
            {words} words · ~{pages} page{pages === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={text} />
            <PdfDownloadButton
              title={`${profile?.businessName ?? "BidBridge"} response`}
              text={text}
              fileName={`${slugifyFileName(opportunity.title)}-response.pdf`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function fallbackProposal(profile: Profile, opportunity: Opportunity): string {
  return `# Response to ${opportunity.title}

${profile.businessName} can provide the requested work under NAICS ${opportunity.naicsCode ?? profile.naicsCodes.join(", ")}. The firm is a ${profile.isSmallBusiness ? "small business" : "business"} with qualifying categories ${profile.qualifyingCategories.join(", ") || "available in profile"}.

## Technical Approach
We will confirm requirements with the contracting office, document deliverables, establish a production schedule, and provide quality checks before delivery.

## Relevant Capability
${profile.description}

## Price and Schedule
Pricing will be submitted in the requested format and aligned to the stated scope, period of performance, and delivery requirements.

## Compliance
${profile.businessName} will follow all solicitation instructions, set-aside eligibility requirements, and attachment requirements listed by the agency.`;
}
