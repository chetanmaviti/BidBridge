export type FeedFilter = "all" | "under-250k" | "set-aside" | "closing-soon" | "nearby";

const filters: Array<{ value: FeedFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "under-250k", label: "Under $250K" },
  { value: "set-aside", label: "Set-aside" },
  { value: "closing-soon", label: "Closing soon" },
  { value: "nearby", label: "Within 100mi" },
];

export function FilterChips({
  active,
  onChange,
}: {
  active: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`whitespace-nowrap rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
            active === filter.value
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border bg-surface text-ink-muted hover:border-border-bright hover:text-ink"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
