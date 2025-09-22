export const maxDuration = 20;

import { streamText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq, createGroq } from "@ai-sdk/groq";

type BYOK = {
  openai?: string;
  anthropic?: string;
  google?: string;
  groq?: string;
};

function resolveModel(selected?: string, keys?: BYOK) {
  const name = (selected ?? "").trim();
  const openaiProv = keys?.openai
    ? createOpenAI({ apiKey: keys.openai })
    : openai;
  const anthropicProv = keys?.anthropic
    ? createAnthropic({ apiKey: keys.anthropic })
    : anthropic;
  const googleProv = keys?.google
    ? createGoogleGenerativeAI({ apiKey: keys.google })
    : google;
  const groqProv = keys?.groq ? createGroq({ apiKey: keys.groq }) : groq;
  const modelMap: Record<string, () => any> = {
    // OpenAI models
    // Back-compat labels
    "GPT-4.1": () => openaiProv("gpt-4.1"),
    "GPT-4.1 Mini": () => openaiProv("gpt-4.1-mini"),
    // Requested list
    "gpt-4.1": () => openaiProv("gpt-4.1"),
    "gpt-4.1-mini": () => openaiProv("gpt-4.1-mini"),
    "gpt-4.1-nano": () => openaiProv("gpt-4.1-nano"),
    "gpt-4o": () => openaiProv("gpt-4o"),
    "gpt-4o-mini": () => openaiProv("gpt-4o-mini"),
    "gpt-4o-audio-preview": () => openaiProv("gpt-4o-audio-preview"),
    "gpt-4-turbo": () => openaiProv("gpt-4-turbo"),
    "gpt-4": () => openaiProv("gpt-4"),
    "gpt-3.5-turbo": () => openaiProv("gpt-3.5-turbo"),
    o1: () => openaiProv("o1"),
    "o3-mini": () => openaiProv("o3-mini"),
    o3: () => openaiProv("o3"),
    "o4-mini": () => openaiProv("o4-mini"),
    "chatgpt-4o-latest": () => openaiProv("chatgpt-4o-latest"),
    "gpt-5": () => openaiProv("gpt-5"),
    "gpt-5-mini": () => openaiProv("gpt-5-mini"),
    "gpt-5-nano": () => openaiProv("gpt-5-nano"),
    "gpt-5-chat-latest": () => openaiProv("gpt-5-chat-latest"),

    // Anthropic models
    // Back-compat labels
    "Claude 4 Opus": () => anthropicProv("claude-opus-4-20250514"),
    "Claude 4 Sonnet": () => anthropicProv("claude-sonnet-4-20250514"),
    "Claude 3.5 Sonnet": () => anthropicProv("claude-3-5-sonnet-20241022"),
    "Claude 3.5 Haiku": () => anthropicProv("claude-3-5-haiku-20241022"),
    // Requested list
    "claude-opus-4-20250514": () => anthropicProv("claude-opus-4-20250514"),
    "claude-sonnet-4-20250514": () => anthropicProv("claude-sonnet-4-20250514"),
    "claude-3-7-sonnet-20250219": () => anthropicProv("claude-3-7-sonnet-20250219"),
    "claude-3-5-sonnet-20241022": () => anthropicProv("claude-3-5-sonnet-20241022"),
    "claude-3-5-sonnet-20240620": () => anthropicProv("claude-3-5-sonnet-20240620"),
    "claude-3-5-haiku-20241022": () => anthropicProv("claude-3-5-haiku-20241022"),
    "claude-3-opus-20240229": () => anthropicProv("claude-3-opus-20240229"),
    "claude-3-sonnet-20240229": () => anthropicProv("claude-3-sonnet-20240229"),
    "claude-3-haiku-20240307": () => anthropicProv("claude-3-haiku-20240307"),

    // Google models
    // Back-compat labels
    "Gemini 2.5 Pro": () => googleProv("gemini-2.5-pro"),
    "Gemini 2.5 Flash": () => googleProv("gemini-2.5-flash"),
    "Gemini 2.0 Flash": () => googleProv("gemini-2.0-flash"),
    "Gemini 2.0 Flash Thinking": () => googleProv("gemini-2.0-flash"),
    // Requested list
    "gemini-2.5-pro": () => googleProv("gemini-2.5-pro"),
    "gemini-2.5-flash": () => googleProv("gemini-2.5-flash"),
    "gemini-2.5-flash-lite": () => googleProv("gemini-2.5-flash-lite"),
    "gemini-2.5-flash-lite-preview-06-17": () =>
      googleProv("gemini-2.5-flash-lite-preview-06-17"),
    "gemini-2.0-flash": () => googleProv("gemini-2.0-flash"),
    "gemini-1.5-pro": () => googleProv("gemini-1.5-pro"),
    "gemini-1.5-pro-latest": () => googleProv("gemini-1.5-pro-latest"),
    "gemini-1.5-flash": () => googleProv("gemini-1.5-flash"),
    "gemini-1.5-flash-latest": () => googleProv("gemini-1.5-flash-latest"),
    "gemini-1.5-flash-8b": () => googleProv("gemini-1.5-flash-8b"),
    "gemini-1.5-flash-8b-latest": () => googleProv("gemini-1.5-flash-8b-latest"),

    // Groq models
    // Reasoning-capable
    "DeepSeek R1 Llama 70B": () => groqProv("deepseek-r1-distill-llama-70b"),
    "DeepSeek R1 Qwen 32B": () => groqProv("deepseek-r1-distill-qwen-32b"),
    "Qwen 3 32B": () => groqProv("qwen/qwen3-32b"),
    "Qwen QWQ 32B": () => groqProv("qwen-qwq-32b"),
    "qwen-2.5-32b": () => groqProv("qwen-2.5-32b"),
    // General models
    "Llama 3.3 70B": () => groqProv("llama-3.3-70b-versatile"),
    "Llama 3.1 8B Instant": () => groqProv("llama-3.1-8b-instant"),
    "Llama 3 70B 8k": () => groqProv("llama3-70b-8192"),
    "Llama 3 8B 8k": () => groqProv("llama3-8b-8192"),
    "Gemma2 9B": () => groqProv("gemma2-9b-it"),
    "Mixtral 8x7B 32k": () => groqProv("mixtral-8x7b-32768"),
    "Moonshot Kimi K2": () => groqProv("moonshotai/kimi-k2-instruct"),
    // Multi-modal / safety
    "Llama 4 Scout 17B": () =>
      groqProv("meta-llama/llama-4-scout-17b-16e-instruct"),
    "Llama 4 Maverick 17B": () =>
      groqProv("meta-llama/llama-4-maverick-17b-128e-instruct"),
    "Llama Guard 3 8B": () => groqProv("llama-guard-3-8b"),
    "meta-llama/llama-guard-4-12b": () => groqProv("meta-llama/llama-guard-4-12b"),
    "meta-llama/llama-prompt-guard-2-22m": () =>
      groqProv("meta-llama/llama-prompt-guard-2-22m"),
    "meta-llama/llama-prompt-guard-2-86m": () =>
      groqProv("meta-llama/llama-prompt-guard-2-86m"),
    // OSS models with Browser Search support
    "OpenAI GPT-OSS 20B (Groq)": () => groqProv("openai/gpt-oss-20b"),
    "OpenAI GPT-OSS 120B (Groq)": () => groqProv("openai/gpt-oss-120b"),
    // Raw Groq model IDs
    "gemma2-9b-it": () => groqProv("gemma2-9b-it"),
    "llama-3.1-8b-instant": () => groqProv("llama-3.1-8b-instant"),
    "llama-3.3-70b-versatile": () => groqProv("llama-3.3-70b-versatile"),
    "deepseek-r1-distill-llama-70b": () =>
      groqProv("deepseek-r1-distill-llama-70b"),
    "meta-llama/llama-4-maverick-17b-128e-instruct": () =>
      groqProv("meta-llama/llama-4-maverick-17b-128e-instruct"),
    "meta-llama/llama-4-scout-17b-16e-instruct": () =>
      groqProv("meta-llama/llama-4-scout-17b-16e-instruct"),
    "moonshotai/kimi-k2-instruct": () => groqProv("moonshotai/kimi-k2-instruct"),
    "qwen/qwen3-32b": () => groqProv("qwen/qwen3-32b"),
    "llama-guard-3-8b": () => groqProv("llama-guard-3-8b"),
    "llama3-70b-8192": () => groqProv("llama3-70b-8192"),
    "llama3-8b-8192": () => groqProv("llama3-8b-8192"),
    "mixtral-8x7b-32768": () => groqProv("mixtral-8x7b-32768"),
    "qwen-qwq-32b": () => groqProv("qwen-qwq-32b"),
    "deepseek-r1-distill-qwen-32b": () => groqProv("deepseek-r1-distill-qwen-32b"),
    "openai/gpt-oss-20b": () => groqProv("openai/gpt-oss-20b"),
    "openai/gpt-oss-120b": () => groqProv("openai/gpt-oss-120b"),
  };
  return modelMap[name]?.() || googleProv("gemini-2.5-flash");
}

export async function POST(req: Request) {
  try {
    const {
      text,
      model: selectedModel,
      prePrompt,
      keys,
    }: { text?: string; model?: string; prePrompt?: string; keys?: BYOK } = await req.json();
    const toFormat = (text ?? "").trim();
    if (!toFormat) {
      return Response.json({ text: "" });
    }

    const model = resolveModel(selectedModel, keys);

    const systemPromptParts = [
      "You are a prompt formatter.",
      "Rewrite the user's input into a clear, concise, well-structured prompt.",
      "- Preserve technical details and intent.",
      "- Fix typos and grammar.",
      "- Use bullet points, sections, and code fences where useful.",
      "- Avoid adding assumptions.",
      "Return ONLY the improved prompt text without any preamble or explanation.",
    ];
    if ((prePrompt ?? "").trim()) {
      systemPromptParts.push((prePrompt as string).trim());
    }
    const systemPrompt = systemPromptParts.join("\n");

    const selectedName = (selectedModel ?? "").trim();
    const stOptions: any = {
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: toFormat }],
    };

    // Add Groq provider options for reasoning models when applicable
    const groqNames = new Set([
      "DeepSeek R1 Llama 70B",
      "DeepSeek R1 Qwen 32B",
      "Qwen 3 32B",
      "Qwen QWQ 32B",
      "Llama 3.3 70B",
      "Llama 3.1 8B Instant",
      "Llama 3 70B 8k",
      "Llama 3 8B 8k",
      "Gemma2 9B",
      "Mixtral 8x7B 32k",
      "Moonshot Kimi K2",
      "Llama 4 Scout 17B",
      "Llama 4 Maverick 17B",
      "Llama Guard 3 8B",
      "OpenAI GPT-OSS 20B (Groq)",
      "OpenAI GPT-OSS 120B (Groq)",
    ]);
    if (groqNames.has(selectedName)) {
      const reasoningModels = new Set([
        "DeepSeek R1 Llama 70B",
        "DeepSeek R1 Qwen 32B",
        "Qwen 3 32B",
        "Qwen QWQ 32B",
      ]);
      stOptions.providerOptions = {
        groq: {
          parallelToolCalls: true,
          serviceTier: "flex",
          ...(reasoningModels.has(selectedName)
            ? { reasoningFormat: "parsed" }
            : {}),
        },
      };
    }

    const result = streamText(stOptions);

    let acc = "";
    for await (const part of result.textStream) {
      acc += part;
    }

    return Response.json({ text: acc.trim() });
  } catch (e) {
    return Response.json({ text: "" }, { status: 200 });
  }
}
