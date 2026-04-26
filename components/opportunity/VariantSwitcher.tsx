export type ProposalVariant = "shorter" | "more-technical" | "emphasize-past-performance";

const variants: Array<{ value: ProposalVariant; label: string }> = [
  { value: "shorter", label: "Shorter" },
  { value: "more-technical", label: "More technical" },
  { value: "emphasize-past-performance", label: "Past performance" },
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
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <button
          type="button"
          key={variant.value}
          disabled={disabled}
          onClick={() => onSelect(variant.value)}
          className={`rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            active === variant.value
              ? "border-accent bg-accent text-bg"
              : "border-border bg-bg text-ink-muted hover:text-ink"
          }`}
        >
          {variant.label}
        </button>
      ))}
    </div>
  );
}
