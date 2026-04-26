import { NextResponse } from "next/server";
import { getOpportunity } from "@/lib/samApi";
import { FALLBACK_OPPORTUNITIES } from "@/lib/mock/opportunities";
import { buildCohort, computeStats } from "@/lib/awardIntelligence";
import type { Opportunity, Profile, SetAsideCode } from "@/lib/types";
import { ALL_SET_ASIDES } from "@/lib/setAsides";

export const runtime = "nodejs";

const VALID_SET_ASIDES = new Set<SetAsideCode>(ALL_SET_ASIDES);

function profileFromQuery(req: Request): Profile {
  const url = new URL(req.url);
  const state = url.searchParams.get("state") ?? "MD";
  const isSmall = url.searchParams.get("isSmall") !== "false";
  const revenueRange = (url.searchParams.get("revenueRange") ?? "100k-500k") as Profile["revenueRange"];
  const categoriesRaw = url.searchParams.get("categories") ?? "";
  const qualifyingCategories = categoriesRaw
    .split(",")
    .map((s) => s.trim() as SetAsideCode)
    .filter((s) => VALID_SET_ASIDES.has(s));
  return {
    businessName: "",
    yearFounded: 0,
    employees: 0,
    revenueRange,
    address: "",
    city: "",
    state,
    zip: "",
    description: "",
    naicsCodes: [],
    ownership: [],
    inHubZone: qualifyingCategories.includes("HZC"),
    isSmallBusiness: isSmall,
    qualifyingCategories,
    createdAt: new Date().toISOString(),
  };
}

async function opportunityFromRequest(req: Request, id: string): Promise<Opportunity | null> {
  if (req.method === "POST") {
    try {
      const body = (await req.json()) as { opportunity?: Opportunity };
      if (body.opportunity?.id === id) return body.opportunity;
    } catch {
      // Fall through to the normal lookup path.
    }
  }

  let opp = id.startsWith("MOCK-")
    ? FALLBACK_OPPORTUNITIES.find((o) => o.id === id)
    : null;
  if (!opp) {
    try {
      opp = (await getOpportunity(id)) ?? FALLBACK_OPPORTUNITIES.find((o) => o.id === id);
    } catch {
      opp = FALLBACK_OPPORTUNITIES.find((o) => o.id === id);
    }
  }
  return opp ?? null;
}

async function handle(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const opp = await opportunityFromRequest(req, id);
  if (!opp) return NextResponse.json({ error: "opportunity not found" }, { status: 404 });

  const profile = profileFromQuery(req);

  try {
    const cohort = await buildCohort(opp);
    if (!cohort) {
      return NextResponse.json({
        stats: null,
        insufficientData: true,
        reason: "no NAICS code on opportunity",
      });
    }
    const stats = computeStats(cohort, profile);
    return NextResponse.json({ stats });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({
      stats: null,
      insufficientData: true,
      reason: msg,
    });
  }
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  return handle(req, context);
}

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  return handle(req, context);
}
