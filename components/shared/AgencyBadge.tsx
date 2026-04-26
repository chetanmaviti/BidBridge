import type { Opportunity } from "@/lib/types";
import { fullAgency } from "@/lib/format";

export function AgencyBadge({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="inline-flex max-w-full items-center rounded border border-border bg-bg/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-normal text-ink-muted">
      <span className="truncate">{fullAgency(opportunity)}</span>
    </div>
  );
}
