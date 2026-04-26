import Link from "next/link";

export function Logo() {
  return (
    <Link href="/feed" className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-normal">
      <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/40 bg-accent/10 font-mono text-sm text-accent">
        B
      </span>
      <span>Bid</span>
    </Link>
  );
}
