import { formatMoney } from "@/lib/format";
import type { IntelligenceStats } from "@/lib/types";

export function RecentAwardsTable({ stats }: { stats: IntelligenceStats }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <div className="border-b border-border px-5 py-4">
        <p className="font-display text-lg font-semibold">Recent awards</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-border font-mono text-[11px] uppercase tracking-normal text-ink-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Recipient</th>
              <th className="px-5 py-3 font-medium">Award</th>
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Set-aside</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recentAwards.map((award) => (
              <tr key={award.id}>
                <td className="px-5 py-3 text-ink">{award.recipientName}</td>
                <td className="px-5 py-3 font-mono text-accent">{formatMoney(award.amount)}</td>
                <td className="px-5 py-3 font-mono text-ink-muted">
                  {shortDate(award.startDate)} - {shortDate(award.endDate)}
                </td>
                <td className="px-5 py-3 text-ink-muted">{award.setAsideType ?? "Unknown"}</td>
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
