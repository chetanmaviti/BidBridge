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
      ? "text-ink-dim border-border"
      : days !== null && days < 7
        ? "text-danger border-danger/30 bg-danger/8"
        : days !== null && days < 14
          ? "text-warn border-warn/30 bg-warn/8"
          : "text-ink-muted border-border bg-bg";

  return (
    <span className={`badge ${tone}`}>
      <Clock className="h-2.5 w-2.5" />
      {deadlineLabel(date)}
    </span>
  );
}
