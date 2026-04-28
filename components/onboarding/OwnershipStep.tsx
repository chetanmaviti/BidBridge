import { Check, MapPinned } from "lucide-react";
import type { OwnershipFlag, SetAsideCode } from "@/lib/types";
import { QualificationsPanel } from "./QualificationsPanel";

const ownershipOptions: Array<{ value: OwnershipFlag; label: string; body: string }> = [
  {
    value: "woman-owned",
    label: "Woman-owned",
    body: "At least 51% owned and controlled by women.",
  },
  {
    value: "veteran-owned",
    label: "Veteran-owned",
    body: "Owned and controlled by one or more veterans.",
  },
  {
    value: "service-disabled-veteran-owned",
    label: "Service-disabled veteran-owned",
    body: "Eligible for SDVOSB set-asides.",
  },
  {
    value: "disadvantaged",
    label: "Disadvantaged owner",
    body: "Flags potential 8(a) and EDWOSB eligibility.",
  },
];

export function OwnershipStep({
  ownership,
  onToggle,
  inHubZone,
  hubZoneSource,
  address,
  categories,
  isSmall,
}: {
  ownership: OwnershipFlag[];
  onToggle: (flag: OwnershipFlag) => void;
  inHubZone: boolean;
  hubZoneSource: string;
  address: string;
  categories: SetAsideCode[];
  isSmall: boolean;
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {ownershipOptions.map((option) => {
          const active = ownership.includes(option.value);
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                active
                  ? "border-accent/60 bg-accent/5"
                  : "border-border bg-surface hover:border-border-bright"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{option.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{option.body}</p>
                </div>
                {active ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-bg">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className={`rounded-xl border p-4 ${inHubZone ? "border-accent/30 bg-accent/5" : "border-border bg-bg/60"}`}>
        <div className="flex items-start gap-3">
          <MapPinned className={`mt-0.5 h-4 w-4 shrink-0 ${inHubZone ? "text-accent" : "text-ink-muted"}`} />
          <div>
            <p className="text-sm font-medium text-ink">
              {inHubZone
                ? "Headquarters confirmed in a HUBZone."
                : "HUBZone not confirmed for this address."}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {address || "Add an address in step 1 to run the SBA check."}
              {hubZoneSource ? ` · Verified via ${hubZoneSource}.` : ""}
            </p>
          </div>
        </div>
      </div>

      <QualificationsPanel categories={categories} isSmall={isSmall} />
    </section>
  );
}
