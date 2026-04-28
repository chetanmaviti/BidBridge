"use client";

export function StreamingText({
  text,
  loading,
  placeholder = "Preparing analysis…",
}: {
  text: string;
  loading: boolean;
  placeholder?: string;
}) {
  if (!text && loading) {
    return (
      <div className="space-y-2.5">
        <div className="h-3.5 w-3/4 rounded-md shimmer" />
        <div className="h-3.5 w-full rounded-md shimmer" />
        <div className="h-3.5 w-2/3 rounded-md shimmer" />
        <div className="h-3.5 w-5/6 rounded-md shimmer" />
      </div>
    );
  }

  if (!text) {
    return (
      <p className="text-sm text-ink-muted">{placeholder}</p>
    );
  }

  return (
    <div
      className={`whitespace-pre-wrap text-sm leading-relaxed text-ink ${loading ? "cursor" : ""}`}
    >
      {text}
    </div>
  );
}
