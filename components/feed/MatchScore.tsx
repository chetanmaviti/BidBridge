export function MatchScore({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 85 ? "var(--accent)" : clamped >= 65 ? "var(--warn)" : "var(--ink-muted)";
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: 56, height: 56 }}
      title={`Match score: ${score}`}
    >
      <svg viewBox="0 0 56 56" width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-mono text-sm font-semibold tabular leading-none"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}
