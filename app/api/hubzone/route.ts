import { NextResponse } from "next/server";
import { checkHubZone } from "@/lib/hubzoneApi";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") ?? "";
  if (!address.trim()) {
    return NextResponse.json(
      { inHubZone: false, error: "address query param required" },
      { status: 400 }
    );
  }
  const result = await checkHubZone(address);
  return NextResponse.json(result);
}
