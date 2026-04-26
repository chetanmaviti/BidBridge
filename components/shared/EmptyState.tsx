import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-8 text-center">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
