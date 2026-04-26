export function ProgressBar({ step }: { step: number }) {
  const steps = ["Basics", "Sell", "Certify"];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {steps.map((label, index) => {
          const active = index <= step;
          return (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                  active
                    ? "border-accent bg-accent text-bg"
                    : "border-border bg-surface text-ink-muted"
                }`}
              >
                {index + 1}
              </div>
              <span className={`text-sm ${active ? "text-ink" : "text-ink-muted"}`}>
                {label}
              </span>
              {index < steps.length - 1 ? (
                <div className={`h-px flex-1 ${index < step ? "bg-accent" : "bg-border"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
