"use client";

import { motion } from "framer-motion";
import type { IntelligenceStats } from "@/lib/types";

export function VelocitySparkline({ stats }: { stats: IntelligenceStats }) {
  const values = stats.velocity.map((v) => v.count);
  const max = Math.max(1, ...values);
  const width = 220;
  const height = 88;
  const barWidth = 16;
  const gap = (width - barWidth * values.length) / Math.max(1, values.length - 1);
  const trend =
    stats.velocityTrend.direction === "flat"
      ? "flat"
      : `${stats.velocityTrend.direction} ${stats.velocityTrend.multiplier}x`;

  return (
    <div className="rounded-lg border border-border bg-bg p-5">
      <p className="font-mono text-xs uppercase tracking-normal text-ink-muted">Award velocity</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-24 w-full overflow-visible">
        {values.map((count, index) => {
          const barHeight = Math.max(6, (count / max) * (height - 12));
          const x = index * (barWidth + gap);
          const y = height - barHeight;
          return (
            <motion.rect
              key={`${index}-${count}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={index >= values.length / 2 ? "var(--accent)" : "var(--ink-muted)"}
              initial={{ scaleY: 0, transformOrigin: "bottom" }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
            />
          );
        })}
      </svg>
      <p className="font-mono text-sm text-ink">{trend}</p>
      <p className="mt-1 text-sm text-ink-muted">Over the last 8 quarters</p>
    </div>
  );
}
