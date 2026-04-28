import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/feed"
      className="inline-flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight text-ink"
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent font-mono text-xs font-bold text-bg shadow-[0_0_12px_var(--accent-glow)]">
        B
      </span>
      BidBridge
    </Link>
  );
}
