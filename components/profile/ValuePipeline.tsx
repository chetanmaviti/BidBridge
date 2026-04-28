import { formatMoney } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

export function ValuePipeline({ saved }: { saved: Opportunity[] }) {
  const total = saved.reduce(
    (sum, opp) => sum + (opp.estimatedValue ?? opp.awardCeiling ?? 0),
    0
  );
  const closingSoon = saved.filter((opp) => {
    if (!opp.responseDeadLine) return false;
    const days = Math.ceil(
      (new Date(opp.responseDeadLine).getTime() - Date.now()) / 86_400_000
    );
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
      <Metric label="Saved opportunities" value={String(saved.length)} />
      <Metric label="Pipeline value" value={formatMoney(total)} accent />
      <Metric label="Closing soon" value={String(closingSoon)} warn={closingSoon > 0} />
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  const color = accent ? "text-accent" : warn ? "text-warn" : "text-ink";
  return (
    <div className="bg-surface px-5 py-5">
      <p className="label">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular ${color}`}>{value}</p>
    </div>
  );
}
