import { formatMoney } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function ValuePipeline({ saved }: { saved: Opportunity[] }) {
  const total = saved.reduce((sum, opp) => sum + (opp.estimatedValue ?? opp.awardCeiling ?? 0), 0);
  const closingSoon = saved.filter((opp) => {
    if (!opp.responseDeadLine) return false;
    const days = Math.ceil((new Date(opp.responseDeadLine).getTime() - Date.now()) / 86_400_000);
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Metric label="Saved opportunities" value={String(saved.length)} />
      <Metric label="Pipeline value" value={formatMoney(total)} accent />
      <Metric label="Closing soon" value={String(closingSoon)} />
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink-muted">{label}</p>
      <p className={`mt-3 font-mono text-3xl font-semibold tabular ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
