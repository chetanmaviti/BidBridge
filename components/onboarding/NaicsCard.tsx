import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NaicsSuggestion = {
  code: string;
  title: string;
  confidence: number;
  why: string;
};

export function NaicsCard({
  item,
  selected,
  disabled,
  onToggle,
}: {
  item: NaicsSuggestion;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border bg-surface p-4 text-left transition-all",
        selected
          ? "border-accent/60 bg-accent/5 shadow-[0_0_0_1px_var(--accent-glow)]"
          : "border-border hover:border-border-bright",
        disabled && !selected ? "cursor-not-allowed opacity-40" : "hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-accent">{item.code}</p>
          <h3 className="mt-1 text-sm font-semibold text-ink">{item.title}</h3>
        </div>
        {selected ? <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" /> : null}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.why}</p>
      <p className="mt-2 font-mono text-[10px] text-ink-muted">
        {Math.round(item.confidence * 100)}% match
      </p>
    </button>
  );
}

export type { NaicsSuggestion };
