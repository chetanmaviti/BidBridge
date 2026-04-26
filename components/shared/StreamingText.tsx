"use client";

export function StreamingText({
  text,
  loading,
  placeholder = "Preparing analysis...",
}: {
  text: string;
  loading: boolean;
  placeholder?: string;
}) {
  if (!text && loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-2/3 rounded shimmer" />
      </div>
    );
  }

  return (
    <div
      className={`whitespace-pre-wrap text-sm leading-6 text-ink ${loading ? "cursor" : ""}`}
    >
      {text || placeholder}
    </div>
  );
}
