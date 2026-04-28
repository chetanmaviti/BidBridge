export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-32 rounded-md shimmer" />
              <div className="h-5 w-16 rounded-md shimmer" />
            </div>
            <div className="h-5 w-4/5 rounded-md shimmer" />
            <div className="h-4 w-full rounded-md shimmer" />
            <div className="h-4 w-3/4 rounded-md shimmer" />
          </div>
          <div className="h-14 w-14 shrink-0 rounded-full shimmer" />
        </div>
        <div className="mt-4 h-16 rounded-lg shimmer" />
      </div>
      <div className="h-10 border-t border-border shimmer" />
    </div>
  );
}
