import { Loader2, Sparkles } from "lucide-react";
import { NaicsCard, type NaicsSuggestion } from "./NaicsCard";

export function WhatYouSellStep({
  description,
  onDescriptionChange,
  suggestions,
  selectedCodes,
  onToggleCode,
  onClassify,
  loading,
  error,
}: {
  description: string;
  onDescriptionChange: (value: string) => void;
  suggestions: NaicsSuggestion[];
  selectedCodes: string[];
  onToggleCode: (code: string) => void;
  onClassify: () => void;
  loading: boolean;
  error?: string;
}) {
  return (
    <section className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-normal text-ink-muted">
          What do you sell?
        </span>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-40 w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent"
          placeholder="We make custom paper packaging, branded product inserts, and short-run printed materials for small food and beverage companies."
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onClassify}
          disabled={loading || description.trim().length < 12}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Classifying your business" : "Classify"}
        </button>
        <p className="text-sm text-ink-muted">Select one to three NAICS codes.</p>
      </div>
      {error ? <p className="text-sm text-warn">{error}</p> : null}
      {suggestions.length ? (
        <div className="grid gap-3">
          {suggestions.map((item) => (
            <NaicsCard
              key={item.code}
              item={item}
              selected={selectedCodes.includes(item.code)}
              disabled={selectedCodes.length >= 3 && !selectedCodes.includes(item.code)}
              onToggle={() => onToggleCode(item.code)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
