import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/gemini";
import {
  CLASSIFY_NAICS_SCHEMA,
  CLASSIFY_NAICS_SYSTEM,
  SUMMARIZE_DETAIL_SCHEMA,
  SUMMARIZE_DETAIL_SYSTEM,
  type StructuredTask,
} from "@/lib/prompts";

export const runtime = "nodejs";

type Body = { task: StructuredTask; input: string };

const TASK_CONFIG = {
  "classify-naics": {
    system: CLASSIFY_NAICS_SYSTEM,
    schema: CLASSIFY_NAICS_SCHEMA,
  },
  "summarize-detail": {
    system: SUMMARIZE_DETAIL_SYSTEM,
    schema: SUMMARIZE_DETAIL_SCHEMA,
  },
} as const;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body?.task || !body?.input) {
    return NextResponse.json({ error: "task and input are required" }, { status: 400 });
  }
  const cfg = TASK_CONFIG[body.task];
  if (!cfg) {
    return NextResponse.json({ error: `unknown task: ${body.task}` }, { status: 400 });
  }

  try {
    const result = await generateStructured({
      task: body.task,
      systemPrompt: cfg.system,
      userInput: body.input,
      schema: cfg.schema,
    });
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
