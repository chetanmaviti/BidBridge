"use client";

import { Copy } from "lucide-react";
import { useToast } from "@/components/shared/ToastProvider";

export function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        toast("Copied");
      }}
      disabled={!text.trim()}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Copy className="h-4 w-4" />
      Copy response
    </button>
  );
}
