"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

export default function Landing() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();

  useEffect(() => {
    if (hydrated && profile) router.replace("/feed");
  }, [hydrated, profile, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Subtle dot-grid background */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      {/* Radial gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(61,220,132,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-3xl text-center">
        {/* Version pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            BidBridge · Live SAM.gov data
          </span>
        </div>

        <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight text-ink md:text-7xl">
          $180 billion in federal contracts.
          <br />
          <span className="text-accent">Most go uncontested.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
          BidBridge ranks live SAM.gov opportunities for your business, drafts your response,
          and gives you award intelligence — in seconds.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/onboarding"
            className="btn-primary w-full sm:w-auto px-7 py-3 text-base"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/feed"
            className="btn-ghost w-full sm:w-auto px-7 py-3 text-base"
          >
            Browse opportunities
          </Link>
        </div>

        {/* Feature row */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {[
            { icon: TrendingUp, label: "Live SAM.gov feed", sub: "Updated daily" },
            { icon: Zap, label: "AI-drafted proposals", sub: "In seconds" },
            { icon: Shield, label: "Set-aside matching", sub: "8(a), HUBZone, WOSB" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-2 bg-surface px-6 py-5">
              <Icon className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium text-ink">{label}</p>
              <p className="font-mono text-[11px] text-ink-muted">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
