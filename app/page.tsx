"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";

export default function Landing() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();

  useEffect(() => {
    if (hydrated && profile) router.replace("/feed");
  }, [hydrated, profile, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-normal text-ink-muted">
          Bid / v0.4
        </p>
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
          $180 billion in federal contracts is set aside for small businesses every year.
        </h1>
        <p className="mt-6 text-xl text-ink-muted">
          Most never see a dollar of it. Bid changes that.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
          >
            See the feed
          </Link>
        </div>
        <p className="mt-12 font-mono text-xs text-ink-muted">
          Live SAM.gov / Live USAspending / Live Gemini / No black boxes.
        </p>
      </div>
    </main>
  );
}
