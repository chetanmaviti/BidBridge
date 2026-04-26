import { NextResponse } from "next/server";
import { searchOpportunities, type SamSearchParams } from "@/lib/samApi";
import { FALLBACK_OPPORTUNITIES } from "@/lib/mock/opportunities";
import type { SetAsideCode } from "@/lib/types";
import { ALL_SET_ASIDES } from "@/lib/setAsides";

export const runtime = "nodejs";

const VALID_SET_ASIDES = new Set<SetAsideCode>(ALL_SET_ASIDES);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const naics = url.searchParams.get("naics") ?? "";
  const state = url.searchParams.get("state") ?? undefined;
  const setAside = url.searchParams.get("setAside") ?? "";

  const params: SamSearchParams = {
    naicsCodes: naics
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    state,
    setAsides: setAside
      .split(",")
      .map((s) => s.trim() as SetAsideCode)
      .filter((s) => VALID_SET_ASIDES.has(s)),
    limit: Number(url.searchParams.get("limit") ?? 25),
  };

  try {
    const list = await searchOpportunities(params);
    if (!list.length) {
      return NextResponse.json({ opportunities: FALLBACK_OPPORTUNITIES, fallback: true, reason: "empty-result" });
    }
    return NextResponse.json({ opportunities: list, fallback: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({
      opportunities: FALLBACK_OPPORTUNITIES,
      fallback: true,
      reason: msg,
    });
  }
}
