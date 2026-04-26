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
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Capability statement</h2>
        <PdfDownloadButton
          title={`${businessName} capability statement`}
          text={draft}
          fileName={`${slugifyFileName(businessName)}-capability-statement.pdf`}
        />
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => update(event.currentTarget.innerText)}
        className="min-h-96 whitespace-pre-wrap rounded-lg border border-border bg-bg p-5 text-sm leading-6 text-ink outline-none focus:border-accent"
      >
        {draft || "Capability statement will appear here after onboarding finishes."}
      </div>
    </section>
  );
}
