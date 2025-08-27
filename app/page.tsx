"use client";

import React from "react";
import ReactMarkdown from 'react-markdown';
import { Sidebar } from './components/sidebar/Sidebar';
import { MobileSidebar } from './components/sidebar/MobileSidebar';
import { Thread as ChatThread } from './components/sidebar/ChatThread';
import { IconPlus, IconHamburger } from './components/ui/icons';


function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M2 12h20"></path>
      <path d="M12 2a15.3 15.3 0 0 0 0 20a15.3 15.3 0 0 0 0-20"></path>
    </svg>
  );
}

function IconPlusSparkles() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3v4M3 5h4" />
      <path d="M19 11v4M17 13h4" />
      <path d="M8 20l2-2 2 2 2-2 2 2" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconHat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 10L12 6 2 10l10 4 10-4z" />
      <path d="M6 12v4c3 2 9 2 12 0v-4" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2a2 2 0 1 1-2.83-2.83L15 6" />
    </svg>
  );
}


function IconTools() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconBranch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ChipButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-rose-900 shadow-sm backdrop-blur transition hover:bg-white">
      <span className="text-rose-500">{icon}</span>
      {label}
    </button>
  );
}

type ChatMessage = { 
  id: string; 
  role: "user" | "assistant"; 
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  model?: string;
  tokensPerSecond?: number;
  totalTokens?: number;
  timeToFirstToken?: number;
  timestamp?: number;
};
type Thread = { id: string; title: string; messages: ChatMessage[] };

type Category = "create" | "explore" | "code" | "learn";

const categoryPrompts: Record<Category, string[]> = {
  create: [
    "Write a short story about time travel",
    "Design a logo concept for a tech startup",
    "Create a social media campaign for sustainability",
    "Generate ideas for a mobile app"
  ],
  explore: [
    "What are the latest developments in quantum computing?",
    "Explain the James Webb Space Telescope discoveries",
    "How do neural networks actually work?",
    "What's happening with climate change research?"
  ],
  code: [
    "Build a React component for a todo list",
    "Write a Python script to analyze CSV data",
    "Create a REST API endpoint with authentication",
    "Debug this JavaScript async function"
  ],
  learn: [
    "Teach me about machine learning fundamentals",
    "Explain blockchain technology simply",
    "How do I get started with data science?",
    "What are the basics of cybersecurity?"
  ]
};

interface Toolkit {
  slug: string;
  name: string;
  meta: {
    description: string;
    logo: string;
    tools_count: number;
    categories: Array<{id: string; name: string}>;
  };
  tools?: Tool[];
}

interface Tool {
  name: string;
  slug: string;
  description: string;
  displayName: string;
}

interface ToolCall {
  type: 'tool-call';
  toolName: string;
  toolCallId: string;
  args: any;
}

interface ToolResult {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: any;
}

function MessageActions({ 
  message, 
  onCopy, 
  onBranchOff, 
  onRetry 
}: { 
  message: ChatMessage; 
  onCopy: () => void; 
  onBranchOff: () => void; 
  onRetry: () => void; 
}) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)} sec`;
  };
  
  return (
    <div className="mt-3 flex items-center justify-between text-xs border-t border-rose-200/30 pt-2">
      <div className="flex items-center gap-1">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-rose-100/40 transition-colors hover:text-[#432A78]"
          style={{ color: '#432A78' }}
          title={copied ? 'Copied!' : 'Copy message'}
        >
          <IconCopy />
        </button>
        
        <button
          onClick={onBranchOff}
          className="p-1.5 rounded-md hover:bg-rose-100/40 transition-colors hover:text-[#432A78]"
          style={{ color: '#432A78' }}
          title="Branch off to new conversation with different model"
        >
          <IconBranch />
        </button>
        
        <button
          onClick={onRetry}
          className="p-1.5 rounded-md hover:bg-rose-100/40 transition-colors hover:text-[#432A78]"
          style={{ color: '#432A78' }}
          title="Retry message"
        >
          <IconRefresh />
        </button>
      </div>
      
      <div className="flex items-center gap-3 font-medium" style={{ color: '#432A78' }}>
        {message.model && (
          <span className="text-xs">{message.model}</span>
        )}
        {message.tokensPerSecond && (
          <span className="text-xs">{message.tokensPerSecond.toFixed(2)} tok/sec</span>
        )}
        {message.totalTokens && (
          <span className="text-xs">{message.totalTokens} tokens</span>
        )}
        {message.timeToFirstToken && (
          <span className="text-xs">Time-to-First: {formatDuration(message.timeToFirstToken)}</span>
        )}
      </div>
    </div>
  );
}

function ToolCallComponent({ toolCall, toolResult }: { toolCall: ToolCall; toolResult?: ToolResult }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('GMAIL')) return '✉️';
    if (toolName.includes('CALENDAR')) return '📅';
    if (toolName.includes('GITHUB')) return '🐙';
    if (toolName.includes('SLACK')) return '💬';
    return '🔧';
  };
  
  const getToolDisplayName = (toolName: string) => {
    return toolName.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('t3chat:toolkits');
      if (!raw) return;
      const items = JSON.parse(raw) as Array<{ slug: string; name: string; meta?: { logo?: string } }>;
      const prefix = (toolCall.toolName || '').split('_')[0]?.toLowerCase() || '';
      const match = items.find((tk) =>
        tk.slug?.toLowerCase().includes(prefix) || tk.name?.toLowerCase().includes(prefix)
      );
      if (match?.meta?.logo) setLogoUrl(match.meta.logo);
    } catch {}
  }, [toolCall.toolName]);
  
  return (
    <div className="my-3 w-full rounded-2xl border border-rose-200/70 bg-[#f5dbef] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 min-h-[72px]">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/80 text-[#ca0277] shadow-sm overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="toolkit logo" className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-base">{getToolIcon(toolCall.toolName)}</span>
            )}
          </div>
          <div>
            <div className="font-semibold text-[#ca0277]">{getToolDisplayName(toolCall.toolName)}</div>
            <div className="text-xs text-[#6F4DA3]">
              {toolResult ? '✅ Completed' : '⏳ Running...'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#ca0277] hover:text-[#ca0277]/80 text-sm font-medium underline-offset-2 hover:underline"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-[#6F4DA3]">Input:</div>
            <div className="rounded-lg border border-white/70 bg-white/60 p-2 font-mono text-xs text-[#432A78]">
              {JSON.stringify(toolCall.args, null, 2)}
            </div>
          </div>
          
          {toolResult && (
            <div>
              <div className="mb-1 text-xs font-medium text-[#6F4DA3]">Output:</div>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-white/70 bg-white/60 p-2 font-mono text-xs text-[#432A78]">
                {JSON.stringify(toolResult.result, null, 2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToolsModalContent({ 
  selectedTools, 
  setSelectedTools 
}: { 
  selectedTools: string[]; 
  setSelectedTools: (tools: string[]) => void; 
}) {
  const [toolkits, setToolkits] = React.useState<Toolkit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedToolkit, setExpandedToolkit] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchToolkits() {
      try {
        const response = await fetch('/api/toolkits');
        const data = await response.json();
        setToolkits(data.items || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchToolkits();
  }, []);

  const toggleTool = (toolSlug: string) => {
    if (selectedTools.includes(toolSlug)) {
      setSelectedTools(selectedTools.filter(t => t !== toolSlug));
    } else {
      setSelectedTools([...selectedTools, toolSlug]);
    }
  };

  const expandToolkit = async (toolkit: Toolkit) => {
    if (expandedToolkit === toolkit.slug) {
      setExpandedToolkit(null);
      return;
    }

    if (!toolkit.tools) {
      // Fetch tools for this toolkit
      try {
        const response = await fetch(`/api/toolkits/${toolkit.slug}/tools`);
        const data = await response.json();
        toolkit.tools = data.items || [];
        setToolkits([...toolkits]); // Trigger re-render
      } catch (error) {
      }
    }
    
    setExpandedToolkit(toolkit.slug);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa4673]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toolkits.map((toolkit) => (
        <div key={toolkit.slug} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => expandToolkit(toolkit)}
            className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {toolkit.meta.logo && (
                <img src={toolkit.meta.logo} alt={toolkit.name} className="w-8 h-8" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{toolkit.name}</h3>
                <p className="text-sm text-gray-500">{toolkit.meta.description}</p>
                <p className="text-xs text-gray-400">{toolkit.meta.tools_count} tools</p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedToolkit === toolkit.slug ? '−' : '+'}
            </div>
          </button>
          
          {expandedToolkit === toolkit.slug && toolkit.tools && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="p-4 space-y-2">
                {toolkit.tools.map((tool) => (
                  <label 
                    key={tool.slug || tool.name} 
                    className="flex items-start space-x-3 p-2 hover:bg-white rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.slug || tool.name)}
                      onChange={() => toggleTool(tool.slug || tool.name)}
                      className="mt-1 text-[#aa4673] focus:ring-[#aa4673]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{tool.displayName || tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                      <div className="text-xs text-gray-400 font-mono">{tool.slug || tool.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const STORAGE_THREADS = "t3chat:threads";
  const STORAGE_ACTIVE = "t3chat:activeThreadId";
  const STORAGE_MODEL = "t3chat:selectedModel";
  const STORAGE_SIDEBAR = "t3chat:sidebarCollapsed";

  const [threads, setThreads] = React.useState<Thread[]>([{ id: crypto.randomUUID(), title: "Greeting Title", messages: [] }]);
  const [activeThreadId, setActiveThreadId] = React.useState<string>("");
  const [input, setInput] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("gpt-5-mini");
  const [isModelMenuOpen, setIsModelMenuOpen] = React.useState(false);
  const [modelQuery, setModelQuery] = React.useState("");
  const modelMenuRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messageStartTime, setMessageStartTime] = React.useState<number | null>(null);
  const [firstTokenTime, setFirstTokenTime] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const composerRef = React.useRef<HTMLDivElement | null>(null);
  const [composerHeight, setComposerHeight] = React.useState<number>(160);
  const [selectedCategory, setSelectedCategory] = React.useState<Category>("create");
  const [isToolsModalOpen, setIsToolsModalOpen] = React.useState(false);
  const [selectedTools, setSelectedTools] = React.useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = React.useState(false);
  const [attachmentPreviewContent, setAttachmentPreviewContent] = React.useState<string | null>(null);
  const [attachmentPreviewName, setAttachmentPreviewName] = React.useState<string | null>(null);

  const modelOptions = React.useMemo(
    () => [
      // OpenAI models (2025)
      "o3",
      "o4-mini",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "GPT-4.1",
      "GPT-4.1 Mini",
      // Anthropic models (2025)
      "Claude 4 Opus",
      "Claude 4 Sonnet", 
      "Claude 3.5 Sonnet",
      "Claude 3.5 Haiku",
      // Google models (2025)
      "Gemini 2.5 Pro",
      "Gemini 2.5 Flash",
      "Gemini 2.0 Flash",
      "Gemini 2.0 Flash Thinking",
      // Groq models (2025)
      "DeepSeek R1 Llama 70B",
      "Llama 3.3 70B",
    ],
    []
  );

  const filteredModels = React.useMemo(
    () => modelOptions.filter((m) => m.toLowerCase().includes(modelQuery.toLowerCase())),
    [modelOptions, modelQuery]
  );

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (isModelMenuOpen && modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isModelMenuOpen]);

  // Load from storage on first mount to avoid SSR/CSR mismatch
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_THREADS);
      if (raw) {
        const parsed = JSON.parse(raw) as Thread[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
        }
      }
      const savedActive = localStorage.getItem(STORAGE_ACTIVE);
      if (savedActive) setActiveThreadId(savedActive);
      const savedModel = localStorage.getItem(STORAGE_MODEL);
      if (savedModel) setSelectedModel(savedModel);
      const savedSidebar = localStorage.getItem(STORAGE_SIDEBAR);
      if (savedSidebar) setIsSidebarCollapsed(JSON.parse(savedSidebar));
    } catch {}
  }, []);

  // Persist threads, active thread, and model selection
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THREADS, JSON.stringify(threads));
    } catch {}
  }, [threads]);

  React.useEffect(() => {
    try {
      if (activeThreadId) localStorage.setItem(STORAGE_ACTIVE, activeThreadId);
    } catch {}
  }, [activeThreadId]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODEL, selectedModel);
    } catch {}
  }, [selectedModel]);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SIDEBAR, JSON.stringify(isSidebarCollapsed));
    } catch {}
  }, [isSidebarCollapsed]);

  // Ensure we always have a valid active thread id after hydration
  React.useEffect(() => {
    if (!activeThreadId && threads[0]) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);
  
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, isLoading]);

  // Measure composer height so content never sits under it
  React.useEffect(() => {
    function measure() {
      const h = composerRef.current?.offsetHeight ?? 160;
      setComposerHeight(h);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const showWelcome = (activeThread?.messages.length ?? 0) === 0 && input.trim().length === 0;

  // Prepare attachments payload for API: include JSON content only when it's the special DOM extract JSON
  async function prepareAttachmentsPayload(files: File[]) {
    const results: Array<{ name: string; size: number; type: string; content?: string; domInspExtractData?: boolean }> = [];
    for (const f of files) {
      const base = { name: f.name, size: f.size, type: f.type };
      if (f.type === 'application/json' || f.name.toLowerCase().endsWith('.json')) {
        try {
          const text = await f.text();
          try {
            const parsed = JSON.parse(text);
            const isDom = parsed && parsed.dom_insp_extr_data_json === true;
            if (isDom) {
              // Minify JSON to reduce tokens
              const min = JSON.stringify(parsed);
              results.push({ ...base, content: min, domInspExtractData: true });
              continue;
            }
          } catch {}
          // Non-matching JSON: include only metadata
          results.push(base);
          continue;
        } catch {
          // If reading fails, include only metadata
          results.push(base);
          continue;
        }
      }
      // Non-JSON file: include only metadata
      results.push(base);
    }
    return results;
  }

  async function openAttachmentPreview(file: File) {
    try {
      const name = file.name;
      const type = file.type || "";
      let content = "";
      if (type.startsWith("text/") || type === "application/json" || name.toLowerCase().endsWith(".json")) {
        const raw = await file.text();
        try {
          if (type === "application/json" || name.toLowerCase().endsWith(".json")) {
            content = JSON.stringify(JSON.parse(raw), null, 2);
          } else {
            content = raw;
          }
        } catch {
          content = raw;
        }
      } else {
        content = "Preview not available for this file type.";
      }
      setAttachmentPreviewName(name);
      setAttachmentPreviewContent(content);
      setIsAttachmentModalOpen(true);
    } catch {
      setAttachmentPreviewName(file.name);
      setAttachmentPreviewContent("Failed to read file for preview.");
      setIsAttachmentModalOpen(true);
    }
  }

  async function sendMessage(text: string, retryFromMessage?: ChatMessage) {
    if (!text.trim()) return;
    
    let targetMessages: ChatMessage[];
    if (retryFromMessage) {
      // Find the index of the message we're retrying from
      const msgIndex = activeThread.messages.findIndex(m => m.id === retryFromMessage.id);
      // Keep all messages up to (but not including) the retry message
      targetMessages = activeThread.messages.slice(0, msgIndex);
    } else {
      targetMessages = activeThread.messages;
    }
    
    const userMsg: ChatMessage = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: text.trim(),
      timestamp: Date.now()
    };
    
    const optimistic = threads.map((t) => {
      if (t.id !== activeThread.id) return t;
      const isFirst = targetMessages.length === 0;
      const maybeTitle = isFirst ? text.trim().slice(0, 40) || t.title : t.title;
      return { ...t, title: maybeTitle, messages: [...targetMessages, userMsg] };
    });
    setThreads(optimistic);
    if (!retryFromMessage) setInput("");
    setIsLoading(true);
    setMessageStartTime(Date.now());
    setFirstTokenTime(null);

    try {
      // Build attachments payload (may include JSON content for DOM inspector extracts)
      const attachmentsPayload = await prepareAttachmentsPayload(attachments);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          attachments: attachmentsPayload,
          messages: [...targetMessages, userMsg],
          tools: selectedTools,
        }),
      });

      // If backend streams text/plain, read incrementally; else fall back to JSON
      const contentType = res.headers.get("content-type") || "";
      
      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const streamMsgId = "stream-" + userMsg.id;
        
        // Add initial empty assistant message
        const initialMsg: ChatMessage = { 
          id: streamMsgId, 
          role: "assistant", 
          content: "",
          model: selectedModel,
          timestamp: Date.now()
        };
        setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: [...t.messages, initialMsg] } : t));
        
        if (reader) {
          try {
            let toolCalls: ToolCall[] = [];
            let toolResults: ToolResult[] = [];
            let totalChars = 0;
            let streamStartTime = Date.now();
            let firstChunkTime: number | null = null;
            let lastUpdateTime = streamStartTime;
            
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                break;
              }
              const chunk = decoder.decode(value, { stream: true });
              acc += chunk;
              
              // Track first meaningful chunk time for TTFT
              if (!firstChunkTime && chunk.trim().length > 0) {
                firstChunkTime = Date.now();
              }
              
              // Count characters for token estimation
              totalChars += chunk.length;
              
              // Parse tool calls and results from the accumulated content
              const parseToolData = (content: string) => {
                let cleanContent = content;
                const newToolCalls: ToolCall[] = [...toolCalls];
                const newToolResults: ToolResult[] = [...toolResults];
                
                // Extract tool calls
                const toolCallMatches = cleanContent.matchAll(/__TOOL_CALL__(.*?)__TOOL_CALL__/g);
                for (const match of toolCallMatches) {
                  try {
                    const toolCall = JSON.parse(match[1]) as ToolCall;
                    if (!newToolCalls.find(tc => tc.toolCallId === toolCall.toolCallId)) {
                      newToolCalls.push(toolCall);
                    }
                    cleanContent = cleanContent.replace(match[0], '');
                  } catch (e) {
                  }
                }
                
                // Extract tool results
                const toolResultMatches = cleanContent.matchAll(/__TOOL_RESULT__(.*?)__TOOL_RESULT__/g);
                for (const match of toolResultMatches) {
                  try {
                    const toolResult = JSON.parse(match[1]) as ToolResult;
                    if (!newToolResults.find(tr => tr.toolCallId === toolResult.toolCallId)) {
                      newToolResults.push(toolResult);
                    }
                    cleanContent = cleanContent.replace(match[0], '');
                  } catch (e) {
                  }
                }
                
                toolCalls = newToolCalls;
                toolResults = newToolResults;
                return cleanContent.trim();
              };
              
              const cleanContent = parseToolData(acc);
              
              // Calculate real-time metrics
              const currentTime = Date.now();
              const elapsedTime = (currentTime - streamStartTime) / 1000;
              
              // Better token estimation: ~3.5 chars per token for English text (based on clean content)
              const estimatedTokens = Math.ceil(cleanContent.length / 3.5);
              const tokensPerSecond = estimatedTokens > 0 && elapsedTime > 0.1 ? estimatedTokens / elapsedTime : 0;
              
              // Calculate TTFT from request start
              const ttft = firstChunkTime && messageStartTime ? firstChunkTime - messageStartTime : undefined;
              
              // Update streaming message with real-time metrics
              setThreads((prev) => prev.map((t) => {
                if (t.id !== activeThread.id) return t;
                return {
                  ...t,
                  messages: t.messages.map((m) => 
                    m.id === streamMsgId ? { 
                      ...m, 
                      content: cleanContent,
                      toolCalls,
                      toolResults,
                      timeToFirstToken: ttft,
                      tokensPerSecond: tokensPerSecond > 0 ? tokensPerSecond : undefined,
                      totalTokens: estimatedTokens > 0 ? estimatedTokens : undefined
                    } : m
                  )
                };
              }));
            }
          } catch (error) {
            // Replace streaming message with error
            const errorMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "Sorry, streaming failed." };
            setThreads((prev) => prev.map((t) => {
              if (t.id !== activeThread.id) return t;
              return {
                ...t,
                messages: t.messages.map((m) => m.id === streamMsgId ? errorMsg : m)
              };
            }));
          }
        } else {
          const fullText = await res.text();
          const botMsg: ChatMessage = { 
            id: crypto.randomUUID(), 
            role: "assistant", 
            content: fullText,
            model: selectedModel,
            timestamp: Date.now(),
            timeToFirstToken: firstTokenTime || undefined
          };
          setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: [...t.messages, botMsg] } : t));
        }
      } else {
        const data = await res.json();
        const botMsg: ChatMessage = { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: String(data.content ?? ""),
          model: selectedModel,
          timestamp: Date.now(),
          timeToFirstToken: firstTokenTime || undefined
        };
        setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: [...t.messages, botMsg] } : t));
      }
      setAttachments([]);
    } catch (e) {
      const errorMsg: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        content: "Sorry, something went wrong.",
        model: selectedModel,
        timestamp: Date.now()
      };
      setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, messages: [...t.messages, errorMsg] } : t));
    } finally {
      setIsLoading(false);
      setMessageStartTime(null);
      setFirstTokenTime(null);
    }
  }

  function startNewChat() {
    const id = crypto.randomUUID();
    const newThread: Thread = { id, title: "New Chat", messages: [] };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    setInput("");
  }

  function handleDeleteThread(threadId: string) {
    setThreads((prev) => {
      const filtered = prev.filter(t => t.id !== threadId);
      // If we deleted the active thread, switch to the first remaining thread
      if (threadId === activeThreadId && filtered.length > 0) {
        setActiveThreadId(filtered[0].id);
      } else if (filtered.length === 0) {
        // If no threads left, create a new one
        const newId = crypto.randomUUID();
        const newThread: Thread = { id: newId, title: "New Chat", messages: [] };
        setActiveThreadId(newId);
        return [newThread];
      }
      return filtered;
    });
  }

  function handleRenameThread(threadId: string, newTitle: string) {
    setThreads((prev) => prev.map(t => 
      t.id === threadId ? { ...t, title: newTitle } : t
    ));
  }

  function handleToggleSidebar() {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }

  function handleToggleMobileSidebar() {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  }

  function onSuggestionClick(prompt: string) {
    setInput(prompt);
    // optionally send immediately
    // sendMessage(prompt);
  }
  
  function handleCopyMessage() {
    // Copy functionality is handled within MessageActions component
  }
  
  function handleBranchOff(message: ChatMessage) {
    // Create a new thread starting from this message for trying a different model
    const messageIndex = activeThread.messages.findIndex(m => m.id === message.id);
    const messagesUpToHere = activeThread.messages.slice(0, messageIndex);
    
    const newThreadId = crypto.randomUUID();
    const newThread: Thread = {
      id: newThreadId,
      title: `Branch: ${message.content.slice(0, 30)}...`,
      messages: messagesUpToHere
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
  }
  
  function handleRetryMessage(message: ChatMessage) {
    // Find the user message that generated this assistant response
    const messageIndex = activeThread.messages.findIndex(m => m.id === message.id);
    if (messageIndex > 0) {
      const userMessage = activeThread.messages[messageIndex - 1];
      if (userMessage.role === "user") {
        sendMessage(userMessage.content, message);
      }
    }
  }

  return (
    <div className="font-sans min-h-screen w-full bg-[#fdf7fd]">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={startNewChat}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={startNewChat}
        onDeleteThread={handleDeleteThread}
        onRenameThread={handleRenameThread}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile sidebar toggle */}
      <div className="fixed left-3 top-3 z-50 md:hidden">
        <button
          aria-label="Open sidebar"
          onClick={handleToggleMobileSidebar}
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5dbef] text-[#ca0277] shadow-sm hover:brightness-95"
        >
          <IconHamburger />
        </button>
      </div>
      <div className={"mx-auto flex gap-6 p-4 sm:p-6 lg:py-8 justify-center transition-all duration-300"}>
        
<div className="w-full space-y-6 px-2 pt-8 duration-300 animate-in fade-in-50 zoom-in-90 sm:px-8 pt-18">
          {showWelcome && (
          <section className="mx-auto mt-8 w-full max-w-2xl text-left">
            <h1 className="text-2xl font-semibold font-weight-600 tracking-tight sm:text-[30px] pb-6 pt-12 justify-left text-[#4e2a58]">How can I help you?</h1>

<div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
  <button 
    onClick={() => setSelectedCategory("create")}
    className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
      selectedCategory === "create" 
        ? "bg-[#aa4673] text-primary-foreground shadow hover:bg-[#aa4673]/90" 
        : "bg-secondary/30 text-secondary-foreground/90 outline hover:bg-secondary"
    }`}
  >
    <IconPlusSparkles />
    <div>Create</div>
  </button>
  <button 
    onClick={() => setSelectedCategory("explore")}
    className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
      selectedCategory === "explore" 
        ? "bg-[#aa4673] text-primary-foreground shadow hover:bg-[#aa4673]/90" 
        : "bg-secondary/30 text-secondary-foreground/90 outline hover:bg-secondary"
    }`}
  >
    <IconCompass />
    <div>Explore</div>
  </button>
  <button 
    onClick={() => setSelectedCategory("code")}
    className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
      selectedCategory === "code" 
        ? "bg-[#aa4673] text-primary-foreground shadow hover:bg-[#aa4673]/90" 
        : "bg-secondary/30 text-secondary-foreground/90 outline hover:bg-secondary"
    }`}
  >
    <IconCode />
    <div>Code</div>
  </button>
  <button 
    onClick={() => setSelectedCategory("learn")}
    className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
      selectedCategory === "learn" 
        ? "bg-[#aa4673] text-primary-foreground shadow hover:bg-[#aa4673]/90" 
        : "bg-secondary/30 text-secondary-foreground/90 outline hover:bg-secondary"
    }`}
  >
    <IconHat />
    <div>Learn</div>
  </button>
</div>

            {activeThread?.messages.length === 0 && (
              <div className="mx-auto mt-4 w-full max-w-2xl divide-y divide-rose-100 overflow-hidden rounded-2xl text-left pt-1">
                {categoryPrompts[selectedCategory].map((prompt: string) => (
                  <button
                    key={prompt}
                    onClick={() => onSuggestionClick(prompt)}
                    className="block w-full px-5 py-3 text-left text-rose-900/90 transition hover:bg-[#ed78c6]/20 text-font-10px"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Messages */}
          <div className="mx-auto mt-6 w-full max-w-3xl flex-1" style={{ paddingBottom: composerHeight + 24 }}>
            <div className="space-y-4">
              {activeThread?.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${m.role === "user" ? "flex justify-end" : ""}`}>
                    {/* Tool calls (only for assistant messages) */}
                    {m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mb-3 w-full">
                        {m.toolCalls.map((toolCall) => {
                          const toolResult = m.toolResults?.find(tr => tr.toolCallId === toolCall.toolCallId);
                          return (
                            <ToolCallComponent 
                              key={toolCall.toolCallId}
                              toolCall={toolCall}
                              toolResult={toolResult}
                            />
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Message content */}
                    {m.content && (
                      <div className="w-full">
                        <div
                          className={`${
                            m.role === "user"
                              ? "bg-[#f5dbef] text-[#432A78]"
                              : "bg-[#fdf7fd] text-rose-900"
                          } whitespace-pre-wrap rounded-2xl px-4 py-3`}
                        >
                          {m.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none prose-headings:text-rose-900 prose-p:text-rose-900 prose-li:text-rose-900 prose-strong:text-rose-900 prose-code:text-rose-800 prose-code:bg-rose-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-rose-100 prose-pre:text-rose-800">
                              <ReactMarkdown>
                                {m.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            m.content
                          )}
                        </div>
                        
                        {/* Message Actions - only for assistant messages */}
                        {m.role === "assistant" && (
                          <MessageActions
                            message={m}
                            onCopy={handleCopyMessage}
                            onBranchOff={() => handleBranchOff(m)}
                            onRetry={() => handleRetryMessage(m)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-[#fdf7fd] px-4 py-3">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Composer (floating) */}
          <section className="mx-auto mt-10 w-full max-w-3xl">
            <div className="input-bar" ref={composerRef}>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    onPaste={(e) => {
                      try {
                        const text = e.clipboardData?.getData('text') || '';
                        if (!text) return;
                        const obj = JSON.parse(text);
                        if (obj && obj.dom_insp_extr_data_json === true) {
                          // Intercept paste and turn into attachment
                          e.preventDefault();
                          const filename = `dom_extract_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                          const file = new File([JSON.stringify(obj)], filename, { type: 'application/json' });
                          setAttachments((prev) => [...prev, file]);
                        }
                      } catch {
                        // Not JSON; fall through to normal paste
                      }
                    }}
                    placeholder="Type your message here..."
                    className="h-[68px] w-full resize-none rounded-l-2xl border border-transparent bg-[#FBF7FB] px-4 py-3 text-[#432A78] placeholder-[#6F4DA3] outline-none"
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-rose-700">
                    <div className="relative inline-block" ref={modelMenuRef}>
                      <button
                        aria-haspopup="listbox"
                        aria-expanded={isModelMenuOpen}
                        onClick={() => setIsModelMenuOpen((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 font-medium hover:bg-[#ed78c6]/20"
                      >
                        {selectedModel}
                        <IconChevronDown />
                      </button>
                      {isModelMenuOpen && (
                        <div className="absolute left-0 bottom-full z-50 mb-2 w-72 rounded-xl border border-rose-200/60 bg-white p-2 text-rose-900 shadow-lg">
                          <input
                            autoFocus
                            value={modelQuery}
                            onChange={(e) => setModelQuery(e.target.value)}
                            placeholder="Search models..."
                            className="mb-2 w-full rounded-lg border border-rose-200/60 bg-white px-2.5 py-1 text-xs outline-none"
                          />
                          <ul role="listbox" className="max-h-56 overflow-auto">
                            {filteredModels.length === 0 && (
                              <li className="px-2 py-1 text-xs text-rose-500">No models found</li>
                            )}
                            {filteredModels.map((m) => (
                              <li key={m}>
                                <button
                                  role="option"
                                  onClick={() => { setSelectedModel(m); setIsModelMenuOpen(false); }}
                                  className={`block w-full rounded-md px-2 py-1 text-left text-sm hover:bg-[#ed78c6]/20 ${selectedModel === m ? 'bg-[#ed78c6]/20' : ''}`}
                                >
                                  {m}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsToolsModalOpen(true)}
                      className={`inline-flex items-center gap-1 rounded-full border border-rose-200/60 px-2.5 py-1 font-medium transition ${
                        selectedTools.length > 0 
                          ? "bg-[#aa4673] text-white border-[#aa4673] hover:bg-[#aa4673]/90"
                          : "bg-white/70 hover:bg-white"
                      }`}
                    >
                      <span className={selectedTools.length > 0 ? "text-white" : "text-rose-500"}>
                        <IconTools />
                      </span>
                      Tools {selectedTools.length > 0 && `(${selectedTools.length})`}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0) setAttachments((prev) => [...prev, ...files]);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 font-medium hover:bg-white"
                    >
                      <span className="text-rose-500"><IconPaperclip /></span>
                      Attach
                    </button>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-rose-900/90">
                      {attachments.map((file, idx) => (
                        <span
                          key={`${file.name}-${idx}`}
                          role="button"
                          tabIndex={0}
                          title="Click to preview"
                          onClick={() => openAttachmentPreview(file)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 cursor-pointer hover:bg-white"
                        >
                          {file.name}
                          <button
                            aria-label="Remove attachment"
                            className="ml-1 text-rose-500 hover:text-rose-700"
                            onClick={(e) => { e.stopPropagation(); setAttachments((prev) => prev.filter((_, i) => i !== idx)); }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button aria-label="Send" onClick={() => sendMessage(input)} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-rose-800 to-pink-800 text-white shadow-md transition hover:from-rose-600 hover:to-pink-600">
                  <IconArrowUp />
                </button>
              </div>
            </div>
          </section>
          </div>
      </div>

      {/* Tools Modal */}
      {isToolsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Select Tools</h2>
              <button
                onClick={() => setIsToolsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 h-8 w-8 grid place-items-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 leading-none shrink-0"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <ToolsModalContent 
                selectedTools={selectedTools}
                setSelectedTools={setSelectedTools}
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsToolsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsToolsModalOpen(false)}
                className="inline-flex items-center justify-center px-6 py-2 bg-[#aa4673] text-white rounded-lg hover:bg-[#aa4673]/90 transition leading-none"
              >
                Done ({selectedTools.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {isAttachmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">{attachmentPreviewName || 'Attachment Preview'}</h2>
              <button
                onClick={() => setIsAttachmentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 h-8 w-8 grid place-items-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 leading-none shrink-0"
                aria-label="Close preview"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {attachmentPreviewContent ? (
                <pre className="whitespace-pre-wrap break-words text-sm font-mono text-[#432A78] bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {attachmentPreviewContent}
                </pre>
              ) : (
                <div className="text-gray-500 text-sm">No preview available.</div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsAttachmentModalOpen(false)}
                className="inline-flex items-center justify-center px-6 py-2 bg-[#aa4673] text-white rounded-lg hover:bg-[#aa4673]/90 transition leading-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
