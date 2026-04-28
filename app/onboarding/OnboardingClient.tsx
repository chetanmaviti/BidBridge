"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusinessBasicsStep, type BusinessBasicsValues } from "@/components/onboarding/BusinessBasicsStep";
import { OwnershipStep } from "@/components/onboarding/OwnershipStep";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { WhatYouSellStep } from "@/components/onboarding/WhatYouSellStep";
import type { NaicsSuggestion } from "@/components/onboarding/NaicsCard";
import { Logo } from "@/components/shared/Logo";
import { useProfile } from "@/context/ProfileContext";
import { streamGeneratedText } from "@/lib/clientStreaming";
import { isSmallForAnyNaics } from "@/lib/sizeStandards";
import { qualifyingCategories } from "@/lib/setAsides";
import type { OwnershipFlag, Profile, RevenueRange } from "@/lib/types";

type HubZoneState = {
  inHubZone: boolean;
  expiresOn?: string;
  source: "api" | "fallback" | "";
};

const initialBasics: BusinessBasicsValues = {
  businessName: "",
  dba: "",
  yearFounded: "2021",
  employees: "4",
  revenueRange: "100k-500k",
  address: "",
  city: "",
  state: "MD",
  zip: "",
  website: "",
};

export function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, hydrated, setProfile, setCapabilityStatement } = useProfile();
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState<BusinessBasicsValues>(initialBasics);
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<NaicsSuggestion[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [ownership, setOwnership] = useState<OwnershipFlag[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [hubZone, setHubZone] = useState<HubZoneState>({
    inHubZone: false,
    source: "",
  });
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    message: "",
  });
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState("");
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!hydrated || !profile) return;
    // searchParams can be transiently null during Next 14.2 streaming
    // hydration — guard before reading.
    if (!searchParams || searchParams.get("prefill") !== "true") return;
    setBasics({
      businessName: profile.businessName,
      dba: profile.dba ?? "",
      yearFounded: String(profile.yearFounded || ""),
      employees: String(profile.employees || ""),
      revenueRange: profile.revenueRange,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      website: profile.website ?? "",
    });
    setDescription(profile.description);
    setSelectedCodes(profile.naicsCodes);
    setOwnership(profile.ownership);
    setCoords(profile.coords);
    setHubZone({
      inHubZone: profile.inHubZone,
      expiresOn: profile.hubZoneExpiresOn,
      source: profile.inHubZone ? "api" : "",
    });
  }, [hydrated, profile, searchParams]);

  const fullAddress = useMemo(
    () =>
      [basics.address, basics.city, basics.state, basics.zip]
        .filter(Boolean)
        .join(", "),
    [basics.address, basics.city, basics.state, basics.zip]
  );

  const isSmall = useMemo(
    () =>
      selectedCodes.length
        ? isSmallForAnyNaics(
            {
              employees: Number(basics.employees || 0),
              revenueRange: basics.revenueRange,
            },
            selectedCodes
          )
        : true,
    [basics.employees, basics.revenueRange, selectedCodes]
  );

  const categories = useMemo(
    () => qualifyingCategories(ownership, hubZone.inHubZone, isSmall),
    [ownership, hubZone.inHubZone, isSmall]
  );

  function updateBasics<K extends keyof BusinessBasicsValues>(
    key: K,
    value: BusinessBasicsValues[K]
  ) {
    setBasics((current) => ({ ...current, [key]: value }));
  }

  async function checkLocation() {
    if (!basics.address || !basics.city || !basics.state || !basics.zip) return;
    setLocationStatus({ loading: true, message: "" });
    try {
      const qs = encodeURIComponent(fullAddress);
      const [geoRes, hubRes] = await Promise.all([
        fetch(`/api/geocode?address=${qs}`),
        fetch(`/api/hubzone?address=${qs}`),
      ]);
      if (geoRes.ok) {
        const geo = (await geoRes.json()) as { lat: number; lng: number };
        setCoords({ lat: geo.lat, lng: geo.lng });
      }
      if (hubRes.ok) {
        const hub = (await hubRes.json()) as {
          inHubZone?: boolean;
          expiresOn?: string;
          source?: "api" | "fallback";
        };
        setHubZone({
          inHubZone: Boolean(hub.inHubZone),
          expiresOn: hub.expiresOn,
          source: hub.source ?? "fallback",
        });
        setLocationStatus({
          loading: false,
          message: hub.inHubZone
            ? "HUBZone confirmed by SBA lookup."
            : "Address saved. HUBZone was not confirmed.",
        });
      } else {
        setLocationStatus({
          loading: false,
          message: "Address saved. HUBZone lookup is unavailable.",
        });
      }
    } catch {
      setLocationStatus({
        loading: false,
        message: "Address saved. HUBZone lookup is unavailable.",
      });
    }
  }

  async function classifyBusiness() {
    if (description.trim().length < 12) return;
    setClassifying(true);
    setClassifyError("");
    try {
      const res = await fetch("/api/gemini/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "classify-naics", input: description }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        let msg = "Classification failed.";
        try {
          const parsed = JSON.parse(body) as { error?: string };
          if (parsed.error) msg = parsed.error;
        } catch {
          if (body) msg = body;
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as { result?: { codes?: NaicsSuggestion[] } };
      const codes = (data.result?.codes ?? []).slice(0, 5);
      if (!codes.length) throw new Error("No NAICS codes returned");
      setSuggestions(codes);
      setSelectedCodes((current) => current.filter((code) => codes.some((c) => c.code === code)));
    } catch (e) {
      setSuggestions([]);
      setClassifyError(e instanceof Error ? e.message : "Classification failed. Please try again.");
    } finally {
      setClassifying(false);
    }
  }

  function toggleCode(code: string) {
    setSelectedCodes((current) => {
      if (current.includes(code)) return current.filter((c) => c !== code);
      if (current.length >= 3) return current;
      return [...current, code];
    });
  }

  function toggleOwnership(flag: OwnershipFlag) {
    setOwnership((current) =>
      current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag]
    );
  }

  async function next() {
    if (step === 0) {
      await checkLocation();
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!suggestions.length) {
        await classifyBusiness();
        return;
      }
      if (!selectedCodes.length) return;
      setStep(2);
    }
  }

  async function finish() {
    if (!selectedCodes.length || finishing) return;
    setFinishing(true);
    const nextProfile: Profile = {
      businessName: basics.businessName.trim(),
      dba: basics.dba.trim() || undefined,
      yearFounded: Number(basics.yearFounded || new Date().getFullYear()),
      employees: Number(basics.employees || 0),
      revenueRange: basics.revenueRange as RevenueRange,
      address: basics.address.trim(),
      city: basics.city.trim(),
      state: basics.state,
      zip: basics.zip.trim(),
      website: basics.website.trim() || undefined,
      description: description.trim(),
      naicsCodes: selectedCodes,
      ownership,
      inHubZone: hubZone.inHubZone,
      hubZoneExpiresOn: hubZone.expiresOn,
      isSmallBusiness: isSmall,
      qualifyingCategories: categories,
      coords,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };

    setProfile(nextProfile);
    setCapabilityStatement("Generating capability statement...");
    void generateCapability(nextProfile, setCapabilityStatement);
    router.push("/feed");
  }

  const canStepOne =
    basics.businessName.trim() &&
    basics.yearFounded &&
    basics.employees &&
    basics.address.trim() &&
    basics.city.trim() &&
    basics.state &&
    basics.zip.trim();
  const canContinue =
    step === 0 ? Boolean(canStepOne) : step === 1 ? description.trim().length >= 12 : selectedCodes.length > 0;

  return (
    <main className="min-h-screen bg-bg px-5 py-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="btn-ghost py-2 text-xs"
          >
            Skip to feed
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-border bg-surface shadow-2xl shadow-black/30"
        >
          <div className="border-b border-border px-6 py-4">
            <ProgressBar step={step} />
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
            <div>
              <div className="mb-6">
                <p className="label text-accent">Step {step + 1} of 3</p>
                <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
                  {step === 0
                    ? "Set up your business profile"
                    : step === 1
                      ? "Map your work to federal buying codes"
                      : "Confirm set-aside qualifications"}
                </h1>
              </div>

              {step === 0 ? (
                <BusinessBasicsStep
                  values={basics}
                  update={updateBasics}
                  onAddressBlur={checkLocation}
                  locationStatus={locationStatus}
                />
              ) : null}
              {step === 1 ? (
                <WhatYouSellStep
                  description={description}
                  onDescriptionChange={setDescription}
                  suggestions={suggestions}
                  selectedCodes={selectedCodes}
                  onToggleCode={toggleCode}
                  onClassify={classifyBusiness}
                  loading={classifying}
                  error={classifyError}
                />
              ) : null}
              {step === 2 ? (
                <OwnershipStep
                  ownership={ownership}
                  onToggle={toggleOwnership}
                  inHubZone={hubZone.inHubZone}
                  hubZoneSource={hubZone.source === "api" ? "SBA HUBZone API" : ""}
                  address={fullAddress}
                  categories={categories}
                  isSmall={isSmall}
                />
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="btn-ghost py-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canContinue || classifying}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {step === 1 && !suggestions.length ? "Classify and continue" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finish}
                    disabled={!selectedCodes.length || finishing}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {finishing ? "Saving…" : "Finish profile"}
                  </button>
                )}
              </div>
            </div>

            {/* Live profile sidebar */}
            <aside className="space-y-3 rounded-xl border border-border bg-bg/60 p-4">
              <p className="label mb-1">Live profile</p>
              <Metric label="NAICS" value={selectedCodes.length ? selectedCodes.join(", ") : "Pending"} mono />
              <Metric label="Size status" value={isSmall ? "Small business" : "Check standards"} />
              <Metric label="Set-asides" value={categories.length ? categories.join(", ") : "Pending"} />
              <Metric
                label="HUBZone"
                value={hubZone.inHubZone ? "Confirmed" : "Not confirmed"}
                highlight={hubZone.inHubZone}
              />
            </aside>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <p className="label">{label}</p>
      <p
        className={`mt-1 text-sm font-medium ${mono ? "font-mono" : ""} ${highlight ? "text-accent" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}


async function generateCapability(
  profile: Profile,
  setCapabilityStatement: (text: string) => void
) {
  try {
    await streamGeneratedText({
      task: "capability-statement",
      input: JSON.stringify(profile, null, 2),
      onChunk: (_chunk, fullText) => setCapabilityStatement(fullText),
    });
  } catch {
    setCapabilityStatement(fallbackCapability(profile));
  }
}

function fallbackCapability(profile: Profile): string {
  return `# ${profile.businessName} Capability Statement

## Company Overview
${profile.businessName} is a small business serving federal buyers under NAICS ${profile.naicsCodes.join(", ")}. The company is headquartered in ${profile.city}, ${profile.state} and provides ${profile.description}.

## Core Competencies
- Custom production and fulfillment aligned to federal requirements
- Responsive small-business delivery team
- Quality control, documentation, and deadline management
- Vendor coordination and customer communication

## Differentiators
- Qualified for ${profile.qualifyingCategories.join(", ") || "small business"} opportunities
- Lean team with direct owner involvement
- Located in ${profile.city}, ${profile.state}

## Past Performance
Available upon request.

## Certifications & Set-Asides
${profile.qualifyingCategories.join(", ") || "Small business profile saved"}

## NAICS Codes
${profile.naicsCodes.join(", ")}

## Contact Information
${profile.website ?? "Website available upon request"}`;
}
