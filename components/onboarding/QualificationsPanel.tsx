import { motion } from "framer-motion";
import { SET_ASIDE_CATALOG } from "@/lib/setAsides";
import type { SetAsideCode } from "@/lib/types";

export function QualificationsPanel({
  categories,
  isSmall,
}: {
  categories: SetAsideCode[];
  isSmall: boolean;
}) {
  const visible = categories.filter((code) => code !== "SBA");
  const reserveText = visible.length
    ? `You qualify for ${visible.map((c) => SET_ASIDE_CATALOG[c].shortLabel).join(" + ")} set-asides. About $62B in annual federal contracting is reserved for firms in categories like these.`
    : isSmall
      ? "You qualify for total small business set-asides. Additional ownership certifications can unlock more reserved opportunities."
      : "Your selected NAICS and size inputs do not currently mark the firm as small for federal purposes.";

  return (
    <motion.div
      layout
      className="rounded-lg border border-accent/30 bg-accent/10 p-5"
    >
      <p className="font-display text-lg font-semibold text-ink">Qualification snapshot</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{reserveText}</p>
      {categories.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((code) => (
            <span
              key={code}
              className="rounded border px-2.5 py-1 font-mono text-xs"
              style={{
                borderColor: `${SET_ASIDE_CATALOG[code].color}66`,
                color: SET_ASIDE_CATALOG[code].color,
                backgroundColor: `${SET_ASIDE_CATALOG[code].color}14`,
              }}
            >
              {SET_ASIDE_CATALOG[code].shortLabel}
            </span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
