import { NextResponse } from "next/server";
import { searchOpportunities, type SamSearchParams } from "@/lib/samApi";
import { FALLBACK_OPPORTUNITIES } from "@/lib/mock/opportunities";
import type { Opportunity, SetAsideCode } from "@/lib/types";
import { ALL_SET_ASIDES } from "@/lib/setAsides";

export const runtime = "nodejs";

const VALID_SET_ASIDES = new Set<SetAsideCode>(ALL_SET_ASIDES);

type FilterDrop = "state" | "setAside";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const naics = url.searchParams.get("naics") ?? "";
  const state = url.searchParams.get("state") ?? undefined;
  const setAside = url.searchParams.get("setAside") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 25);

  const naicsCodes = naics
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const setAsides = setAside
    .split(",")
    .map((s) => s.trim() as SetAsideCode)
    .filter((s) => VALID_SET_ASIDES.has(s));

  // Build the broadening ladder: narrow → drop state → drop set-aside.
  // We only fall back to the mock list on a hard API failure or when
  // even the bare-NAICS query is empty (genuinely no federal demand
  // for that industry right now).
  const attempts: Array<{ params: SamSearchParams; dropped: FilterDrop[] }> = [
    { params: { naicsCodes, state, setAsides, limit }, dropped: [] },
  ];
  if (state) {
    attempts.push({
      params: { naicsCodes, setAsides, limit },
      dropped: ["state"],
    });
  }
  if (setAsides.length) {
    attempts.push({
      params: { naicsCodes, limit },
      dropped: state ? ["state", "setAside"] : ["setAside"],
    });
  }

  try {
    let lastList: Opportunity[] = [];
    let lastDropped: FilterDrop[] = [];
    for (const attempt of attempts) {
      const list = await searchOpportunities(attempt.params);
      if (list.length) {
        return NextResponse.json({
          opportunities: list,
          fallback: false,
          empty: false,
          broadened: attempt.dropped,
        });
      }
      lastList = list;
      lastDropped = attempt.dropped;
    }
    // Even the broadest query returned nothing. SAM is up; there are
    // genuinely no current federal opportunities for this NAICS.
    return NextResponse.json({
      opportunities: lastList,
      fallback: false,
      empty: true,
      broadened: lastDropped,
    });
  } catch (e) {
    // Hard SAM failure — show the mock list so the demo doesn't crater.
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({
      opportunities: FALLBACK_OPPORTUNITIES,
      fallback: true,
      empty: false,
      reason: msg,
    });
  }
}
