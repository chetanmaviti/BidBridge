import type { StreamingTask } from "./prompts";

type StreamRequest = {
  task: StreamingTask;
  input: string;
  variant?: string;
  onChunk?: (chunk: string, fullText: string) => void;
};

export async function streamGeneratedText({
  task,
  input,
  variant,
  onChunk,
}: StreamRequest): Promise<string> {
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input, variant }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `AI stream failed with ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onChunk?.(chunk, fullText);
  }

  const tail = decoder.decode();
  if (tail) {
    fullText += tail;
    onChunk?.(tail, fullText);
  }

  return fullText;
}
