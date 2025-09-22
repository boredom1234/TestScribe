// Using Node.js runtime for Composio SDK compatibility
// export const runtime = "edge";
export const maxDuration = 30;

import { streamText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq, createGroq } from "@ai-sdk/groq";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { assistantPrompt } from "@/app/prompt";

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

function streamFromString(
  text: string,
  delayMs = 10
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < text.length; i += 4) {
        controller.enqueue(encoder.encode(text.slice(i, i + 4)));
        await new Promise((r) => setTimeout(r, delayMs));
      }
      controller.close();
    },
  });
}

type BYOK = {
  openai?: string;
  anthropic?: string;
  google?: string;
  groq?: string;
  composio?: string;
};

function resolveModel(selected?: string, keys?: BYOK) {
  const name = (selected ?? "").trim();

  // Build provider instances that prefer client-supplied keys when present
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
    "claude-3-7-sonnet-20250219": () =>
      anthropicProv("claude-3-7-sonnet-20250219"),
    "claude-3-5-sonnet-20241022": () =>
      anthropicProv("claude-3-5-sonnet-20241022"),
    "claude-3-5-sonnet-20240620": () =>
      anthropicProv("claude-3-5-sonnet-20240620"),
    "claude-3-5-haiku-20241022": () =>
      anthropicProv("claude-3-5-haiku-20241022"),
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
    "gemini-1.5-flash-8b-latest": () =>
      googleProv("gemini-1.5-flash-8b-latest"),

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
    "meta-llama/llama-guard-4-12b": () =>
      groqProv("meta-llama/llama-guard-4-12b"),
    "meta-llama/llama-prompt-guard-2-22m": () =>
      groqProv("meta-llama/llama-prompt-guard-2-22m"),
    "meta-llama/llama-prompt-guard-2-86m": () =>
      groqProv("meta-llama/llama-prompt-guard-2-86m"),
    // OSS models with Browser Search support
    "OpenAI GPT-OSS 20B (Groq)": () => groqProv("openai/gpt-oss-20b"),
    "OpenAI GPT-OSS 120B (Groq)": () => groqProv("openai/gpt-oss-120b"),
    // Raw Groq model IDs (to match constants list)
    "gemma2-9b-it": () => groqProv("gemma2-9b-it"),
    "llama-3.1-8b-instant": () => groqProv("llama-3.1-8b-instant"),
    "llama-3.3-70b-versatile": () => groqProv("llama-3.3-70b-versatile"),
    "deepseek-r1-distill-llama-70b": () =>
      groqProv("deepseek-r1-distill-llama-70b"),
    "meta-llama/llama-4-maverick-17b-128e-instruct": () =>
      groqProv("meta-llama/llama-4-maverick-17b-128e-instruct"),
    "meta-llama/llama-4-scout-17b-16e-instruct": () =>
      groqProv("meta-llama/llama-4-scout-17b-16e-instruct"),
    "moonshotai/kimi-k2-instruct": () =>
      groqProv("moonshotai/kimi-k2-instruct"),
    "qwen/qwen3-32b": () => groqProv("qwen/qwen3-32b"),
    "llama-guard-3-8b": () => groqProv("llama-guard-3-8b"),
    "llama3-70b-8192": () => groqProv("llama3-70b-8192"),
    "llama3-8b-8192": () => groqProv("llama3-8b-8192"),
    "mixtral-8x7b-32768": () => groqProv("mixtral-8x7b-32768"),
    "qwen-qwq-32b": () => groqProv("qwen-qwq-32b"),
    "deepseek-r1-distill-qwen-32b": () =>
      groqProv("deepseek-r1-distill-qwen-32b"),
    "openai/gpt-oss-20b": () => groqProv("openai/gpt-oss-20b"),
    "openai/gpt-oss-120b": () => groqProv("openai/gpt-oss-120b"),
  };

  return modelMap[name]?.() || googleProv("gemini-2.5-flash");
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      prompt: explicitPrompt,
      model: selectedModel,
      tools: selectedTools,
      attachments,
      keys,
    }: {
      messages?: Message[];
      prompt?: string;
      model?: string;
      tools?: string[];
      attachments?: Array<{
        name: string;
        size: number;
        type: string;
        content?: string;
        domInspExtractData?: boolean;
        externalContext?: boolean;
      }>;
      keys?: BYOK;
    } = await req.json();

    // Prepare base system prompt with current datetime
    const nowISO = new Date().toISOString();
    const baseSystemPrompt = assistantPrompt.replace(
      /\{\{currentDateTime\}\}/g,
      nowISO
    );

    const msgs: Message[] =
      messages && messages.length > 0
        ? messages
        : [{ role: "user", content: explicitPrompt ?? "" }];

    // Check if DOM JSON attachments are being sent with this request
    // Only inject them into system context if they're new (not already in conversation history)
    let msgsWithAttachment: Message[] = msgs;
    let attachmentSystemContext = "";
    if (attachments && attachments.length > 0) {
      const domJsons = attachments.filter(
        (a) =>
          a.domInspExtractData &&
          typeof a.content === "string" &&
          a.content.length > 0
      );
      if (domJsons.length > 0) {
        // Check if DOM attachment data is already in the conversation history
        const hasExistingAttachment = msgs.some(
          (msg) =>
            msg.role === "user" &&
            msg.content &&
            msg.content.includes("--- ATTACHED DOM EXTRACTION DATA ---")
        );

        if (!hasExistingAttachment) {
          const combined = domJsons
            .map(
              (a) =>
                `Attachment: ${a.name}\n\n\`\`\`json\n${a.content}\n\`\`\``
            )
            .join("\n\n");

          // Add attachment as the first user message if it doesn't exist
          const attachmentMessage: Message = {
            role: "user",
            content: `--- ATTACHED DOM EXTRACTION DATA ---\nDOM extraction data provided by the user. This data persists throughout our conversation - always refer to this exact data when answering questions about the JSON, elements, XPaths, or any related content:\n\n${combined}\n--- END ATTACHMENT DATA ---`,
          };

          msgsWithAttachment = [attachmentMessage, ...msgs];
        }
      }
      // Inject external framework contexts (Playwright / Selenium / Cypress)
      const externalContexts = attachments.filter(
        (a) =>
          a.externalContext &&
          typeof a.content === "string" &&
          a.content.length > 0
      );
      if (externalContexts.length > 0) {
        const hasExistingExternal = msgsWithAttachment.some(
          (msg) =>
            msg.role === "user" &&
            msg.content &&
            msg.content.includes("--- ATTACHED EXTERNAL CONTEXT ---")
        );
        if (!hasExistingExternal) {
          const combinedExt = externalContexts
            .map(
              (a) =>
                `Attachment: ${a.name}\n\n\`\`\`\n${a.content}\n\`\`\``
            )
            .join("\n\n");
          const externalMessage: Message = {
            role: "user",
            content: `--- ATTACHED EXTERNAL CONTEXT ---\nThe following framework reference material is provided by the user. Use it as guidance and ground truth when writing code, picking APIs, and proposing examples. Do not quote excessively; summarize and apply appropriately.\n\n${combinedExt}\n--- END EXTERNAL CONTEXT ---`,
          };
          msgsWithAttachment = [externalMessage, ...msgsWithAttachment];
        }
      }
    }

    try {
      const model = resolveModel(selectedModel, keys);

      let composioTools = {};
      let allTools: Record<string, any> = {};

      // Initialize Composio tools if any are selected
      if (
        selectedTools &&
        selectedTools.length > 0 &&
        (keys?.composio || process.env.COMPOSIO_API_KEY)
      ) {
        try {
          const composio = new Composio({
            apiKey: keys?.composio || process.env.COMPOSIO_API_KEY || "",
            provider: new VercelProvider(),
          });
          // Get tools from Composio - assuming we have a default user ID
          const userId = "default"; // In production, this should be the actual user ID

          // Get tools by their slugs - pass as ToolListParams object
          composioTools = await composio.tools.get(userId, {
            tools: selectedTools,
          });
        } catch (toolError) {}
      }

      // Compose system prompt (append tool guidance when tools are enabled)
      const toolGuidance =
        "You are a helpful assistant. When using tools, always provide a clear response based on the tool results. After executing any tool, explain what you found or accomplished.";
      let systemPrompt = baseSystemPrompt;

      const streamTextOptions: any = {
        model,
        messages: msgsWithAttachment.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        maxSteps: 10,
        experimental_continueSteps: true,
        system: systemPrompt,
      };

      // Provider-specific options for Groq
      const selectedName = (selectedModel ?? "").trim();
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
        streamTextOptions.providerOptions = {
          groq: {
            parallelToolCalls: true,
            serviceTier: "flex",
            ...(reasoningModels.has(selectedName)
              ? { reasoningFormat: "parsed" }
              : {}),
          },
        };
      }

      // Merge Composio tools first (if any)
      if (Object.keys(composioTools).length > 0) {
        allTools = { ...allTools, ...composioTools };
      }

      // Optionally add Groq Browser Search tool when explicitly requested and supported
      const wantsBrowserSearch = Array.isArray(selectedTools)
        ? selectedTools.includes("browser_search")
        : false;
      const browserSupported =
        selectedName === "OpenAI GPT-OSS 20B (Groq)" ||
        selectedName === "OpenAI GPT-OSS 120B (Groq)";
      if (wantsBrowserSearch && browserSupported) {
        allTools = {
          ...allTools,
          browser_search: groq.tools.browserSearch({}),
        };
      }

      // Only add tools if we have any
      if (Object.keys(allTools).length > 0) {
        // Update system prompt to include tool guidance
        systemPrompt = `${baseSystemPrompt}\n\n${toolGuidance}`;
        streamTextOptions.system = systemPrompt;

        streamTextOptions.tools = allTools;
        streamTextOptions.maxToolRoundtrips = 3;
        streamTextOptions.toolChoice = "auto"; // Allow model to choose when to use tools
      }

      const result = streamText(streamTextOptions);

      // For tool-enabled requests, we need a two-step process
      if (Object.keys(composioTools).length > 0) {
        // Create a custom readable stream that handles tool execution then AI response
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let toolResults: any[] = [];
            let toolCalls: any[] = [];

            try {
              // STEP 1: Execute tools

              for await (const part of result.fullStream) {
                if (part.type === "tool-call") {
                  const toolCallData = {
                    type: "tool-call",
                    toolName: part.toolName,
                    toolCallId: part.toolCallId,
                    args: part.input || {},
                  };
                  toolCalls.push(toolCallData);

                  // Send tool call to frontend
                  const toolCallJson = `\n\n__TOOL_CALL__${JSON.stringify(
                    toolCallData
                  )}__TOOL_CALL__\n\n`;
                  controller.enqueue(encoder.encode(toolCallJson));
                } else if (part.type === "tool-result") {
                  const toolResultData = {
                    type: "tool-result",
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    result: part.output || {},
                  };
                  toolResults.push(toolResultData);

                  // Send tool result to frontend
                  const toolResultJson = `\n\n__TOOL_RESULT__${JSON.stringify(
                    toolResultData
                  )}__TOOL_RESULT__\n\n`;
                  controller.enqueue(encoder.encode(toolResultJson));
                }
              }

              // STEP 2: Get AI response based on tool results
              if (toolResults.length > 0) {
                // Create new messages array with tool results
                const messagesWithResults = [
                  ...msgsWithAttachment.map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                  {
                    role: "user" as const,
                    content: `Based on the following tool results, please provide a helpful response:\n\n${toolResults
                      .map(
                        (tr) =>
                          `Tool: ${tr.toolName}\nResult: ${JSON.stringify(
                            tr.result,
                            null,
                            2
                          )}`
                      )
                      .join("\n\n")}`,
                  },
                ];

                // Make second LLM call without tools for the response
                const responseResult = streamText({
                  model,
                  messages: messagesWithResults,
                  system: systemPrompt,
                });

                // Stream the AI response
                for await (const part of responseResult.textStream) {
                  controller.enqueue(encoder.encode(part));
                }
              }
            } catch (error) {
              const errorMsg = `\n\nError: ${
                error instanceof Error ? error.message : "Unknown error"
              }`;
              controller.enqueue(encoder.encode(errorMsg));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-cache",
          },
        });
      }

      // For non-tool requests, use standard text stream
      const response = result.toTextStreamResponse();
      return response;
    } catch (providerError) {
      // Provider not available or missing key; return error message
      const errorMessage =
        "Sorry, AI model is not available. Please check your API keys configuration.";
      return new Response(streamFromString(errorMessage), {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error) {
    return new Response(streamFromString("Sorry, something went wrong."), {
      headers: { "content-type": "text/plain; charset=utf-8" },
      status: 500,
    });
  }
}
