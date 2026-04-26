import { Loader2, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { RevenueRange } from "@/lib/types";

export type BusinessBasicsValues = {
  businessName: string;
  dba: string;
  yearFounded: string;
  employees: string;
  revenueRange: RevenueRange;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
};

type LocationStatus = {
  loading: boolean;
  message: string;
};

const revenueOptions: Array<{ value: RevenueRange; label: string }> = [
  { value: "under-100k", label: "Under $100K" },
  { value: "100k-500k", label: "$100K-$500K" },
  { value: "500k-1m", label: "$500K-$1M" },
  { value: "1m-5m", label: "$1M-$5M" },
  { value: "5m-10m", label: "$5M-$10M" },
  { value: "10m-50m", label: "$10M-$50M" },
  { value: "over-50m", label: "Over $50M" },
];

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
  "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX",
  "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function BusinessBasicsStep({
  values,
  update,
  onAddressBlur,
  locationStatus,
}: {
  values: BusinessBasicsValues;
  update: <K extends keyof BusinessBasicsValues>(key: K, value: BusinessBasicsValues[K]) => void;
  onAddressBlur: () => void;
  locationStatus: LocationStatus;
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business name" required>
          <input
            value={values.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className="input"
            placeholder="Maria's Custom Packaging"
          />
        </Field>
        <Field label="DBA">
          <input
            value={values.dba}
            onChange={(e) => update("dba", e.target.value)}
            className="input"
            placeholder="Optional"
          />
        </Field>
        <Field label="Year founded" required>
          <input
            value={values.yearFounded}
            onChange={(e) => update("yearFounded", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="input"
            inputMode="numeric"
            placeholder="2021"
          />
        </Field>
        <Field label="Employees" required>
          <input
            value={values.employees}
            onChange={(e) => update("employees", e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="input"
            inputMode="numeric"
            placeholder="4"
          />
        </Field>
        <Field label="Annual revenue" required>
          <select
            value={values.revenueRange}
            onChange={(e) => update("revenueRange", e.target.value as RevenueRange)}
            className="input"
          >
            {revenueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Website">
          <input
            value={values.website}
            onChange={(e) => update("website", e.target.value)}
            className="input"
            placeholder="https://example.com"
          />
        </Field>
      </div>

      <div className="rounded-lg border border-border bg-bg/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <MapPin className="h-4 w-4 text-accent" />
          Headquarters address
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_120px_120px]">
          <Field label="Street" required compact>
            <input
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              onBlur={onAddressBlur}
              className="input"
              placeholder="4523 Knox Rd"
            />
          </Field>
          <Field label="City" required compact>
            <input
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              onBlur={onAddressBlur}
              className="input"
              placeholder="Hyattsville"
            />
          </Field>
          <Field label="State" required compact>
            <select
              value={values.state}
              onChange={(e) => update("state", e.target.value)}
              onBlur={onAddressBlur}
              className="input"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ZIP" required compact>
            <input
              value={values.zip}
              onChange={(e) => update("zip", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))}
              onBlur={onAddressBlur}
              className="input"
              inputMode="numeric"
              placeholder="20781"
            />
          </Field>
        </div>
        <div className="mt-3 min-h-5 font-mono text-xs text-ink-muted">
          {locationStatus.loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Checking address
            </span>
          ) : (
            locationStatus.message
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  compact,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  compact?: boolean;
}) {
  return (
    <label className={`block ${compact ? "" : "space-y-2"}`}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-normal text-ink-muted">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
