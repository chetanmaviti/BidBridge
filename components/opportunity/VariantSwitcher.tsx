export type ProposalVariant = "shorter" | "more-technical" | "emphasize-past-performance";

const variants: Array<{ value: ProposalVariant; label: string }> = [
  { value: "shorter", label: "Shorter" },
  { value: "more-technical", label: "Technical" },
  { value: "emphasize-past-performance", label: "Past perf." },
];

export function VariantSwitcher({
  active,
  onSelect,
  disabled,
}: {
  active?: ProposalVariant;
  onSelect: (variant: ProposalVariant) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {variants.map((variant) => (
        <button
          type="button"
          key={variant.value}
          disabled={disabled}
          onClick={() => onSelect(variant.value)}
          className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            active === variant.value
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border bg-bg/60 text-ink-muted hover:border-border-bright hover:text-ink"
          }`}
        >
          {variant.label}
        </button>
      ))}
    </div>
  );
}
