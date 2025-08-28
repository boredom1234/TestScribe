export const maxDuration = 20;

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

function resolveModel(selected?: string) {
  const name = (selected ?? "").trim();
  const modelMap: Record<string, () => any> = {
    // OpenAI models
    "gpt-5": () => openai("gpt-5"),
    "gpt-5-mini": () => openai("gpt-5-mini"),
    "gpt-5-nano": () => openai("gpt-5-nano"),
    o3: () => openai("o3"),
    "o4-mini": () => openai("o4-mini"),
    "GPT-4.1": () => openai("gpt-4.1"),
    "GPT-4.1 Mini": () => openai("gpt-4.1-mini"),

    // Anthropic models
    "Claude 4 Opus": () => anthropic("claude-4-opus-latest"),
    "Claude 4 Sonnet": () => anthropic("claude-4-sonnet-latest"),
    "Claude 3.5 Sonnet": () => anthropic("claude-3-5-sonnet-20241022"),
    "Claude 3.5 Haiku": () => anthropic("claude-3-5-haiku-20241022"),

    // Google models
    "Gemini 2.5 Pro": () => google("gemini-2.5-pro"),
    "Gemini 2.5 Flash": () => google("gemini-2.5-flash"),
    "Gemini 2.0 Flash": () => google("gemini-2.0-flash-exp"),
    "Gemini 2.0 Flash Thinking": () => google("gemini-2.0-flash-thinking-exp"),

    // Groq models
    "DeepSeek R1 Llama 70B": () => groq("deepseek-r1-distill-llama-70b"),
    "Llama 3.3 70B": () => groq("llama-3.3-70b-versatile"),
  };
  return modelMap[name]?.() || google("gemini-2.5-flash");
}

export async function POST(req: Request) {
  try {
    const { text, model: selectedModel }: { text?: string; model?: string } =
      await req.json();
    const toFormat = (text ?? "").trim();
    if (!toFormat) {
      return Response.json({ text: "" });
    }

    const model = resolveModel(selectedModel);

    const systemPrompt = [
      "You are a prompt formatter.",
      "Rewrite the user's input into a clear, concise, well-structured prompt.",
      "- Preserve technical details and intent.",
      "- Fix typos and grammar.",
      "- Use bullet points, sections, and code fences where useful.",
      "- Avoid adding assumptions.",
      "Return ONLY the improved prompt text without any preamble or explanation.",
    ].join("\n");

    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: toFormat }],
    });

    let acc = "";
    for await (const part of result.textStream) {
      acc += part;
    }

    return Response.json({ text: acc.trim() });
  } catch (e) {
    return Response.json({ text: "" }, { status: 200 });
  }
}
