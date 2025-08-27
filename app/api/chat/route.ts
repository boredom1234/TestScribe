// Using Node.js runtime for Composio SDK compatibility
// export const runtime = "edge";
export const maxDuration = 30;

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { assistantPrompt } from "@/app/prompt";

type Role = "user" | "assistant" | "system";

interface Message {
  role: Role;
  content: string;
}

function streamFromString(text: string, delayMs = 10): ReadableStream<Uint8Array> {
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

function resolveModel(selected?: string) {
  const name = (selected ?? "").trim();

  const modelMap: Record<string, () => any> = {
    // OpenAI models
    "gpt-5": () => openai("gpt-5"),
    "gpt-5-mini": () => openai("gpt-5-mini"),
    "gpt-5-nano": () => openai("gpt-5-nano"),
    "o3": () => openai("o3"),
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

  return modelMap[name]?.() || openai("gpt-4o-mini");
}

export async function POST(req: Request) {
  try {
    const { messages, prompt: explicitPrompt, model: selectedModel, tools: selectedTools, attachments }: { 
      messages?: Message[]; 
      prompt?: string; 
      model?: string; 
      tools?: string[];
      attachments?: Array<{ name: string; size: number; type: string; content?: string; domInspExtractData?: boolean }>;
    } = await req.json();
    
    // Prepare base system prompt with current datetime
    const nowISO = new Date().toISOString();
    const baseSystemPrompt = assistantPrompt.replace(/\{\{currentDateTime\}\}/g, nowISO);

    const msgs: Message[] = messages && messages.length > 0 
      ? messages 
      : [{ role: "user", content: explicitPrompt ?? "" }];
    
    // If request carries DOM inspector extract JSON attachments, include them as extra user context
    let msgsWithAttachment: Message[] = msgs;
    if (attachments && attachments.length > 0) {
      const domJsons = attachments.filter(a => a.domInspExtractData && typeof a.content === 'string' && a.content.length > 0);
      if (domJsons.length > 0) {
        const combined = domJsons.map(a => `Attachment: ${a.name}\n${a.content}`).join('\n\n');
        msgsWithAttachment = [
          ...msgs,
          { role: "user", content: `Attached DOM extraction data provided by the user. Use this as context for generating test code.\n\n${combined}` }
        ];
      }
    }
    
    
    try {
      const model = resolveModel(selectedModel);
      
      let composioTools = {};
      
      // Initialize Composio tools if any are selected
      if (selectedTools && selectedTools.length > 0 && process.env.COMPOSIO_API_KEY) {
        try {
          const composio = new Composio({
            apiKey: process.env.COMPOSIO_API_KEY,
            provider: new VercelProvider(),
          });
          // Get tools from Composio - assuming we have a default user ID
          const userId = "default"; // In production, this should be the actual user ID
          
          // Get tools by their slugs - pass as array to tools.get
          composioTools = await composio.tools.get(userId, {
            tools: selectedTools,
          });
          
        } catch (toolError) {
        }
      }
      
      // Compose system prompt (append tool guidance when tools are enabled)
      const toolGuidance = "You are a helpful assistant. When using tools, always provide a clear response based on the tool results. After executing any tool, explain what you found or accomplished.";
      let systemPrompt = baseSystemPrompt;
      
      const streamTextOptions: any = {
        model,
        messages: msgsWithAttachment.map(m => ({ role: m.role, content: m.content })),
        maxSteps: 10,
        experimental_continueSteps: true,
        system: systemPrompt,
      };
      
      // Only add tools if we have any
      if (Object.keys(composioTools).length > 0) {
        // Update system prompt to include tool guidance
        systemPrompt = `${baseSystemPrompt}\n\n${toolGuidance}`;
        streamTextOptions.system = systemPrompt;
        
        streamTextOptions.tools = composioTools;
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
                
                if (part.type === 'tool-call') {
                  const toolCallData = {
                    type: 'tool-call',
                    toolName: part.toolName,
                    toolCallId: part.toolCallId,
                    args: part.input || {}
                  };
                  toolCalls.push(toolCallData);
                  
                  // Send tool call to frontend
                  const toolCallJson = `\n\n__TOOL_CALL__${JSON.stringify(toolCallData)}__TOOL_CALL__\n\n`;
                  controller.enqueue(encoder.encode(toolCallJson));
                } else if (part.type === 'tool-result') {
                  const toolResultData = {
                    type: 'tool-result',
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    result: part.output || {}  
                  };
                  toolResults.push(toolResultData);
                  
                  // Send tool result to frontend
                  const toolResultJson = `\n\n__TOOL_RESULT__${JSON.stringify(toolResultData)}__TOOL_RESULT__\n\n`;
                  controller.enqueue(encoder.encode(toolResultJson));
                }
              }
              
              
              // STEP 2: Get AI response based on tool results
              if (toolResults.length > 0) {
                
                // Create new messages array with tool results
                const messagesWithResults = [
                  ...msgsWithAttachment.map(m => ({ role: m.role, content: m.content })),
                  {
                    role: "user" as const,
                    content: `Based on the following tool results, please provide a helpful response:\n\n${toolResults.map(tr => `Tool: ${tr.toolName}\nResult: ${JSON.stringify(tr.result, null, 2)}`).join('\n\n')}`
                  }
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
              const errorMsg = `\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
              controller.enqueue(encoder.encode(errorMsg));
            } finally {
              controller.close();
            }
          }
        });
        
        return new Response(stream, {
          headers: { 
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'no-cache'
          }
        });
      }
      
      // For non-tool requests, use standard text stream
      const response = result.toTextStreamResponse();
      return response;
    } catch (providerError) {
      // Provider not available or missing key; return error message
      const errorMessage = "Sorry, AI model is not available. Please check your API keys configuration.";
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