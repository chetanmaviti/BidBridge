import type { Opportunity } from "@/lib/types";
import { fullAgency } from "@/lib/format";

export function AgencyBadge({ opportunity }: { opportunity: Opportunity }) {
  return (
    <span className="badge border-border bg-bg/40 text-ink-muted">
      <span className="truncate max-w-[200px]">{fullAgency(opportunity)}</span>
    </span>
  );
}
