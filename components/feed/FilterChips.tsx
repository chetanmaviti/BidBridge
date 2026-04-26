export type FeedFilter = "all" | "under-250k" | "set-aside" | "closing-soon" | "nearby";

const filters: Array<{ value: FeedFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "under-250k", label: "Under $250K" },
  { value: "set-aside", label: "Set-aside only" },
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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors ${
            active === filter.value
              ? "border-accent bg-accent text-bg"
              : "border-border bg-surface text-ink-muted hover:text-ink"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
