import { generateStream } from "@/lib/gemini";
import {
  AWARD_INTEL_RECS_SYSTEM,
  CAPABILITY_STATEMENT_SYSTEM,
  DRAFT_PROPOSAL_SYSTEM,
  PROPOSAL_VARIANT_SYSTEM,
  SUMMARIZE_CARD_SYSTEM,
  type StreamingTask,
} from "@/lib/prompts";

export const runtime = "nodejs";

type Body = {
  task: StreamingTask;
  input: string;
  variant?: string; // for proposal-variant: "shorter" | "more-technical" | "emphasize-past-performance"
};

function systemFor(body: Body): string | null {
  switch (body.task) {
    case "capability-statement": return CAPABILITY_STATEMENT_SYSTEM;
    case "summarize-card": return SUMMARIZE_CARD_SYSTEM;
    case "draft-proposal": return DRAFT_PROPOSAL_SYSTEM;
    case "proposal-variant": return PROPOSAL_VARIANT_SYSTEM(body.variant ?? "shorter");
    case "award-intel-recs": return AWARD_INTEL_RECS_SYSTEM;
    default: return null;
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), { status: 400 });
  }
  if (!body?.task || !body?.input) {
    return new Response(JSON.stringify({ error: "task and input are required" }), { status: 400 });
  }
  const system = systemFor(body);
  if (!system) {
    return new Response(JSON.stringify({ error: `unknown task: ${body.task}` }), { status: 400 });
  }

  try {
    const stream = await generateStream({
      task: body.variant ? `${body.task}:${body.variant}` : body.task,
      systemPrompt: system,
      userInput: body.input,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
}
