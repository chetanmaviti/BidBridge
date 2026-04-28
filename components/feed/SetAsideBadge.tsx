import { SET_ASIDE_CATALOG } from "@/lib/setAsides";
import type { SetAsideCode } from "@/lib/types";

export function SetAsideBadge({ code }: { code?: SetAsideCode | null }) {
  if (!code) {
    return (
      <span className="badge border-border text-ink-muted">Open</span>
    );
  }
  const def = SET_ASIDE_CATALOG[code];
  return (
    <span
      className="badge"
      style={{
        color: def.color,
        borderColor: `${def.color}44`,
        backgroundColor: `${def.color}0d`,
      }}
      title={def.label}
    >
      {def.shortLabel}
    </span>
  );
}
