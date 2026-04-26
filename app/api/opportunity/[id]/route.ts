import { NextResponse } from "next/server";
import { getOpportunity } from "@/lib/samApi";
import { FALLBACK_OPPORTUNITIES } from "@/lib/mock/opportunities";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Mock IDs short-circuit to the fallback list (used when SAM is offline).
  if (id.startsWith("MOCK-")) {
    const mock = FALLBACK_OPPORTUNITIES.find((o) => o.id === id);
    if (mock) return NextResponse.json({ opportunity: mock, fallback: true });
  }

  try {
    const opp = await getOpportunity(id);
    if (!opp) {
      const mock = FALLBACK_OPPORTUNITIES.find((o) => o.id === id);
      if (mock) return NextResponse.json({ opportunity: mock, fallback: true });
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ opportunity: opp, fallback: false });
  } catch (e) {
    const mock = FALLBACK_OPPORTUNITIES.find((o) => o.id === id);
    if (mock) return NextResponse.json({ opportunity: mock, fallback: true });
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
