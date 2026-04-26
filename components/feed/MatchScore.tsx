export function MatchScore({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = score >= 85 ? "var(--accent)" : score >= 65 ? "var(--warn)" : "var(--ink-muted)";

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-lg font-semibold tabular" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}
