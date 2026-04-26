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
              className={`rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 ${
                active
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-accent/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-ink">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{option.body}</p>
                </div>
                {active ? (
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-bg">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-bg/60 p-5">
        <div className="flex items-start gap-3">
          <MapPinned className={`mt-0.5 h-5 w-5 ${inHubZone ? "text-accent" : "text-ink-muted"}`} />
          <div>
            <p className="font-medium text-ink">
              {inHubZone ? "Your headquarters is in a HUBZone." : "HUBZone not confirmed for this address."}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {address || "Add an address in step 1 to run the check."}
              {hubZoneSource ? ` Verified via ${hubZoneSource}.` : ""}
            </p>
          </div>
        </div>
      </div>

      <QualificationsPanel categories={categories} isSmall={isSmall} />
    </section>
  );
}
