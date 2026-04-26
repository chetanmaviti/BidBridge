"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { daysUntil, deadlineLabel } from "@/lib/format";

export function DeadlineBadge({ date }: { date?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const days = daysUntil(date);
  const tone =
    days !== null && days < 0
      ? "text-ink-muted border-border"
      : days !== null && days < 7
        ? "text-danger border-danger/40 bg-danger/10"
        : days !== null && days < 14
          ? "text-warn border-warn/40 bg-warn/10"
          : "text-ink-muted border-border bg-bg";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] ${tone}`}>
      <Clock className="h-3 w-3" />
      {deadlineLabel(date)}
    </span>
  );
}
