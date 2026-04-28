import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function RecentAwardsTable({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg/60">
      <div className="border-b border-border px-5 py-3.5">
        <p className="text-sm font-semibold text-ink">Recent awards</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="px-5 py-2.5"><span className="label">Recipient</span></th>
              <th className="px-5 py-2.5"><span className="label">Award</span></th>
              <th className="px-5 py-2.5"><span className="label">Period</span></th>
              <th className="px-5 py-2.5"><span className="label">Set-aside</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recentAwards.map((award) => (
              <tr key={award.id} className="transition-colors hover:bg-surface/40">
                <td className="px-5 py-3 text-sm text-ink">{award.recipientName}</td>
                <td className="px-5 py-3 font-mono text-sm text-accent tabular">
                  {formatMoney(award.amount)}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-ink-muted">
                  {shortDate(award.startDate)} – {shortDate(award.endDate)}
                </td>
                <td className="px-5 py-3 text-xs text-ink-muted">
                  {award.setAsideType ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function shortDate(date?: string): string {
  if (!date) return "TBD";
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) return "TBD";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
