import { Category } from "../types/chat";

export const categoryPrompts: Record<Category, string[]> = {
  create: [
    "Write a short story about time travel",
    "Design a logo concept for a tech startup",
    "Create a social media campaign for sustainability",
    "Generate ideas for a mobile app",
  ],
  explore: [
    "What are the latest developments in quantum computing?",
    "Explain the James Webb Space Telescope discoveries",
    "How do neural networks actually work?",
    "What's happening with climate change research?",
  ],
  code: [
    "Build a React component for a todo list",
    "Write a Python script to analyze CSV data",
    "Create a REST API endpoint with authentication",
    "Debug this JavaScript async function",
  ],
  learn: [
    "Teach me about machine learning fundamentals",
    "Explain blockchain technology simply",
    "How do I get started with data science?",
    "What are the basics of cybersecurity?",
  ],
};

export type Provider = "OpenAI" | "Anthropic" | "Google" | "Groq";

export const modelGroups: { provider: Provider; models: string[] }[] = [
  {
    provider: "OpenAI",
    models: [
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4o-audio-preview",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "o1",
      "o3-mini",
      "o3",
      "o4-mini",
      "chatgpt-4o-latest",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-5-chat-latest",
    ],
  },
  {
    provider: "Anthropic",
    models: [
      "claude-opus-4-20250514",
      "claude-sonnet-4-20250514",
      "claude-3-7-sonnet-20250219",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-20240620",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ],
  },
  {
    provider: "Google",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash-lite-preview-06-17",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-8b-latest",
    ],
  },
  {
    provider: "Groq",
    models: [
      "gemma2-9b-it",
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "meta-llama/llama-guard-4-12b",
      "deepseek-r1-distill-llama-70b",
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "meta-llama/llama-prompt-guard-2-22m",
      "meta-llama/llama-prompt-guard-2-86m",
      "moonshotai/kimi-k2-instruct",
      "qwen/qwen3-32b",
      "llama-guard-3-8b",
      "llama3-70b-8192",
      "llama3-8b-8192",
      "mixtral-8x7b-32768",
      "qwen-qwq-32b",
      "qwen-2.5-32b",
      "deepseek-r1-distill-qwen-32b",
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
    ],
  },
];

// Backward-compatible flat list
export const modelOptions = modelGroups.flatMap((g) => g.models);
