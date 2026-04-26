import { SET_ASIDE_CATALOG } from "@/lib/setAsides";
import type { SetAsideCode } from "@/lib/types";

export function SetAsideBadge({ code }: { code?: SetAsideCode | null }) {
  if (!code) {
    return (
      <span className="rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-ink-muted">
        Open
      </span>
    );
  }
  const def = SET_ASIDE_CATALOG[code];
  return (
    <span
      className="rounded border px-2 py-1 font-mono text-[11px]"
      style={{
        color: def.color,
        borderColor: `${def.color}66`,
        backgroundColor: `${def.color}14`,
      }}
      title={def.label}
    >
      {def.shortLabel}
    </span>
  );
}
