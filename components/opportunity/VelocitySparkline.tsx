"use client";

import { motion } from "framer-motion";
import type { IntelligenceStats } from "@/lib/types";

export function VelocitySparkline({ stats }: { stats: IntelligenceStats }) {
  const values = stats.velocity.map((v) => v.count);
  const max = Math.max(1, ...values);
  const width = 200;
  const height = 72;
  const barWidth = Math.max(8, Math.floor((width - (values.length - 1) * 4) / values.length));
  const gap = values.length > 1 ? (width - barWidth * values.length) / (values.length - 1) : 0;
  const trend =
    stats.velocityTrend.direction === "flat"
      ? "Stable"
      : `${stats.velocityTrend.direction === "up" ? "↑" : "↓"} ${stats.velocityTrend.multiplier}×`;
  const trendColor =
    stats.velocityTrend.direction === "up"
      ? "text-accent"
      : stats.velocityTrend.direction === "down"
        ? "text-danger"
        : "text-ink-muted";

  return (
    <div className="rounded-xl border border-border bg-bg/60 p-4">
      <p className="label">Award velocity</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-[72px] w-full overflow-visible">
        {values.map((count, index) => {
          const barHeight = Math.max(4, (count / max) * (height - 8));
          const x = index * (barWidth + gap);
          const y = height - barHeight;
          const isRecent = index >= values.length / 2;
          return (
            <motion.rect
              key={`${index}-${count}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={isRecent ? "var(--accent)" : "var(--border-bright)"}
              opacity={isRecent ? 1 : 0.7}
              initial={{ scaleY: 0, transformOrigin: "bottom" }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
            />
          );
        })}
      </svg>
      <p className={`mt-1 font-mono text-sm font-semibold ${trendColor}`}>{trend}</p>
      <p className="text-xs text-ink-muted">Last 8 quarters</p>
    </div>
  );
}
