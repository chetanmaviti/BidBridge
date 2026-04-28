export function ProgressBar({ step }: { step: number }) {
  const steps = ["Basics", "What you sell", "Certifications"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, index) => {
        const done = index < step;
        const active = index === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold transition-all ${
                  done
                    ? "bg-accent/20 text-accent"
                    : active
                      ? "bg-accent text-bg shadow-[0_0_8px_var(--accent-glow)]"
                      : "border border-border text-ink-muted"
                }`}
              >
                {done ? "✓" : index + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  active ? "text-ink" : done ? "text-ink-muted" : "text-ink-dim"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div className="flex-1 overflow-hidden rounded-full bg-border" style={{ height: 2 }}>
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: index < step ? "100%" : "0%" }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
