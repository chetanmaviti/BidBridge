import { Suspense } from "react";
import { OnboardingClient } from "./OnboardingClient";

// Required because OnboardingClient calls useSearchParams() — without a
// Suspense boundary Next.js fails the static-prerender pass at build time.
// fallback must be visible (not null) — otherwise any client-hydration
// suspend-or-mismatch yields a fully blank page with no signal.
export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingClient />
    </Suspense>
  );
}

function OnboardingFallback() {
  return (
    <main className="min-h-screen bg-bg px-5 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 h-8 w-32 rounded shimmer" />
        <div className="rounded-lg border border-border bg-surface p-8">
          <div className="space-y-3">
            <div className="h-3 w-1/4 rounded shimmer" />
            <div className="h-8 w-2/3 rounded shimmer" />
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <div className="h-10 w-full rounded shimmer" />
                <div className="h-10 w-full rounded shimmer" />
                <div className="h-10 w-full rounded shimmer" />
              </div>
              <div className="h-40 rounded shimmer" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
