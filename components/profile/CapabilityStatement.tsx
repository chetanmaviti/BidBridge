"use client";

import { useEffect, useRef, useState } from "react";
import { PdfDownloadButton } from "@/components/shared/PdfDownloadButton";
import { slugifyFileName } from "@/lib/format";

export function CapabilityStatement({
  businessName,
  text,
  onChange,
}: {
  businessName: string;
  text: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(text);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  function update(value: string) {
    setDraft(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(value), 400);
  }

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Capability statement</h2>
        <PdfDownloadButton
          title={`${businessName} capability statement`}
          text={draft}
          fileName={`${slugifyFileName(businessName)}-capability-statement.pdf`}
          className="btn-ghost py-1.5 text-xs"
        />
      </div>
      <div className="p-5">
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => update(event.currentTarget.innerText)}
          className="min-h-96 whitespace-pre-wrap rounded-lg border border-border bg-bg/60 p-4 text-sm leading-relaxed text-ink outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
        >
          {draft || "Capability statement will appear here after onboarding finishes."}
        </div>
      </div>
    </section>
  );
}
