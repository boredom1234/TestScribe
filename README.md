# testscribe

A powerful AI chat interface built with Next.js that integrates multiple AI providers with Composio tools for enhanced functionality.

## Features

- **Test generation**: Generate runnable tests for Playwright (TypeScript), Cypress, and Selenium.
- **DOM JSON ingestion**: Attach DOM inspection JSON marked with "dom_insp_extr_data_json": true. The data is persisted in the conversation and automatically injected into model context by `app/api/chat/route.ts`.
- **Framework contexts**: Attach Playwright/Selenium/Cypress reference packs via the top-right Framework Contexts menu (fetched from Context7). Per-thread attachment with badge indicator.
- **Composio tools**: Select tools in the Tools modal to enable agentic actions. Tool calls and results stream into the UI; responses are synthesized after tool execution.
- **Multi-model support**: OpenAI, Anthropic, Google Gemini, Groq.
- **Streaming responses**: Low-latency, incremental output.
- **Modern UI**: Sidebar threads, branching, in-place user edit and retry, token counter chip, scroll-to-bottom.
- **Attachments & preview**: Upload files; JSON is pretty-printed in previews.
- **Persistent history**: Threads and settings saved to localStorage.

## Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- API keys for desired AI providers
- Composio API key for tool integration

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
 
 Create a `.env.local` file in the project root and add:
 
```bash
# AI Provider API Keys (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key

# Composio Integration (required for tools)
COMPOSIO_API_KEY=your_composio_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using TestScribe

- **Choose a model**: Use the model selector in the composer.
- **Attach framework contexts (optional)**: Click the plus icon at top-right and select Playwright, Selenium, or Cypress to fetch docs from Context7 for grounding.
- **Attach DOM JSON (optional but recommended)**: Click the paperclip to upload your DOM extraction JSON. It must include `"dom_insp_extr_data_json": true`.
- **Pick tools (optional)**: Open the Tools modal and select Composio tools if the task needs external actions.
- **Describe your test**: For example, "Generate Playwright tests that fill and submit the customer form and assert server validation."

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

Built with modern technologies:

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **AI Integration**: Vercel AI SDK with multi-provider support
- **Tools Platform**: Composio for external service integrations
- **Context fetcher**: Context7-backed API for Playwright/Selenium/Cypress reference packs
- **Styling**: TailwindCSS with custom design system
- **Type Safety**: TypeScript throughout

## Supported AI Models

### OpenAI

- GPT-5, GPT-5 Mini, GPT-5 Nano
- O3, O4 Mini
- GPT-4.1, GPT-4.1 Mini

### Anthropic

- Claude 4 Opus, Claude 4 Sonnet
- Claude 3.5 Sonnet, Claude 3.5 Haiku

### Google

- Gemini 2.5 Pro, Gemini 2.5 Flash
- Gemini 2.0 Flash, Gemini 2.0 Flash Thinking

### Groq

- DeepSeek R1 Llama 70B
- Llama 3.3 70B

## Tool Integration

TestScribe integrates with Composio to enable tool-augmented agents.
- Select tools in the Tools modal. When enabled, tool calls and results are streamed to the UI. After tools finish, a second LLM pass synthesizes the final answer based on results.
- Set `COMPOSIO_API_KEY` in your environment. If no key or tools are selected, the app falls back to plain model chatting.

## API Routes

- `app/api/chat/route.ts`: Streams model output. When attachments include DOM JSON or external framework contexts, they are injected as dedicated user messages at the top of the conversation. Handles Composio tools with two-phase streaming.
- `app/api/context/route.ts`: Fetches framework reference text from Context7 (Playwright/Selenium/Cypress).
- `app/api/format/route.ts`: Utility endpoint that rewrites a prompt into a cleaner structure using the selected model.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## References

### Core Integrations

- [Composio Platform](https://composio.dev) - Tools and integrations platform
- [Composio Documentation](https://docs.composio.dev) - Complete integration guides
- [Composio GitHub](https://github.com/composiohq/composio) - Open source repository
- [Context7](https://context7.com) - High-signal framework docs for LLM grounding

### AI Providers

- [OpenAI](https://openai.com) - GPT models and API
- [Anthropic](https://anthropic.com) - Claude models
- [Google AI](https://ai.google.dev) - Gemini models
- [Groq](https://groq.com) - High-speed LLM inference

### Framework & Tools

- [Next.js](https://nextjs.org) - React framework
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS
- [Vercel AI SDK](https://sdk.vercel.ai) - AI application toolkit
- [T3 Stack](https://create.t3.gg) - Modern web development stack

### Inspiration

- [T3 Chat](https://t3.chat) - Modern chat interface inspiration
