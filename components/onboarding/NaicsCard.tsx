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
        "w-full rounded-lg border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/60",
        selected ? "border-accent ring-1 ring-accent/40" : "border-border",
        disabled && !selected ? "cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-border" : ""
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-accent">{item.code}</p>
          <h3 className="mt-1 font-display text-base font-semibold text-ink">
            {item.title}
          </h3>
        </div>
        {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" /> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{item.why}</p>
      <p className="mt-3 font-mono text-xs text-ink-muted">
        {Math.round(item.confidence * 100)}% confidence
      </p>
    </button>
  );
}

export type { NaicsSuggestion };
