export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <div className="h-5 w-40 rounded shimmer" />
          <div className="h-7 w-4/5 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-2/3 rounded shimmer" />
        </div>
        <div className="h-16 w-16 rounded-full shimmer" />
      </div>
    </div>
  );
}
