import { GoogleGenAI, type Schema } from "@google/genai";
import { TTL, cacheGet, cacheSet, hashKey } from "./cache";

const MODEL = "gemini-2.5-flash";

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env var is not set");
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

// ─── Structured (JSON) generation with caching ─────────────────────────────

export type StructuredArgs = {
  task: string;          // for cache key namespacing
  systemPrompt: string;
  userInput: string;
  schema: Schema;
};

export async function generateStructured<T = unknown>(
  args: StructuredArgs
): Promise<T> {
  const key = `gemini:structured:${args.task}:${hashKey({
    sys: args.systemPrompt,
    in: args.userInput,
  })}`;
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { role: "user", parts: [{ text: args.userInput }] },
    ],
    config: {
      systemInstruction: args.systemPrompt,
      responseMimeType: "application/json",
      responseSchema: args.schema,
      temperature: 0.4,
    },
  });

  const text = res.text ?? "";
  let parsed: T;
  try {
    parsed = JSON.parse(text) as T;
  } catch (e) {
    throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
  }
  cacheSet(key, parsed, TTL.GEMINI);
  return parsed;
}

// ─── Streaming text generation with caching ────────────────────────────────

export type StreamArgs = {
  task: string;
  systemPrompt: string;
  userInput: string;
};

/**
 * Returns a ReadableStream<Uint8Array> compatible with NextResponse.
 * On cache hit, replays the cached completion as a single chunk so the
 * client-side reader still works without a special path.
 */
export async function generateStream(
  args: StreamArgs
): Promise<ReadableStream<Uint8Array>> {
  const key = `gemini:stream:${args.task}:${hashKey({
    sys: args.systemPrompt,
    in: args.userInput,
  })}`;
  const cached = cacheGet<string>(key);
  const encoder = new TextEncoder();

  if (cached !== undefined) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(cached));
        controller.close();
      },
    });
  }

  const ai = getClient();
  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: args.userInput }] }],
    config: {
      systemInstruction: args.systemPrompt,
      temperature: 0.6,
    },
  });

  let buffer = "";
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const t = chunk.text ?? "";
          if (t) {
            buffer += t;
            controller.enqueue(encoder.encode(t));
          }
        }
        cacheSet(key, buffer, TTL.GEMINI);
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/**
 * One-shot non-streaming text generation.
 */
export async function generateText(args: StreamArgs): Promise<string> {
  const key = `gemini:text:${args.task}:${hashKey({
    sys: args.systemPrompt,
    in: args.userInput,
  })}`;
  const cached = cacheGet<string>(key);
  if (cached !== undefined) return cached;

  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: args.userInput }] }],
    config: {
      systemInstruction: args.systemPrompt,
      temperature: 0.6,
    },
  });
  const text = res.text ?? "";
  cacheSet(key, text, TTL.GEMINI);
  return text;
}
