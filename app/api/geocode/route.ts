import { NextResponse } from "next/server";
import { geocode } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") ?? "";
  if (!address.trim()) {
    return NextResponse.json(
      { error: "address query param required" },
      { status: 400 }
    );
  }
  const result = await geocode(address);
  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(result);
}
