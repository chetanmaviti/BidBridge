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
        toast("Copied to clipboard");
      }}
      disabled={!text.trim()}
      className="btn-ghost py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </button>
  );
}
