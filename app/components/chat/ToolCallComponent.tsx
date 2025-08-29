import React from "react";
import { ToolCall, ToolResult } from "../../types/chat";

interface ToolCallComponentProps {
  toolCall: ToolCall;
  toolResult?: ToolResult;
}

export function ToolCallComponent({
  toolCall,
  toolResult,
}: ToolCallComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  const getToolIcon = (toolName: string) => {
    if (toolName.includes("GMAIL")) return "✉️";
    if (toolName.includes("CALENDAR")) return "📅";
    if (toolName.includes("GITHUB")) return "🐙";
    if (toolName.includes("SLACK")) return "💬";
    return "🔧";
  };

  const getToolDisplayName = (toolName: string) => {
    return toolName
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("t3chat:toolkits");
      if (!raw) return;
      const items = JSON.parse(raw) as Array<{
        slug: string;
        name: string;
        meta?: { logo?: string };
      }>;
      const prefix =
        (toolCall.toolName || "").split("_")[0]?.toLowerCase() || "";
      const match = items.find(
        (tk) =>
          tk.slug?.toLowerCase().includes(prefix) ||
          tk.name?.toLowerCase().includes(prefix),
      );
      if (match?.meta?.logo) setLogoUrl(match.meta.logo);
    } catch {}
  }, [toolCall.toolName]);

  return (
    <div className="my-3 w-full rounded-2xl border border-blue-200/70 bg-[#eff6ff] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 min-h-[72px]">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/80 text-[#2563eb] shadow-sm overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="toolkit logo"
                className="h-5 w-5 object-contain"
              />
            ) : (
              <span className="text-base">
                {getToolIcon(toolCall.toolName)}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-[#1e3a8a]">
              {getToolDisplayName(toolCall.toolName)}
            </div>
            <div className="text-xs text-[#1d4ed8]">
              {toolResult ? "✅ Completed" : "⏳ Running..."}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#2563eb] hover:text-[#2563eb]/80 text-sm font-medium underline-offset-2 hover:underline"
        >
          {isExpanded ? "Hide details" : "Show details"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-[#1d4ed8]">
              Input:
            </div>
            <div className="rounded-lg border border-white/70 bg-white/60 p-2 font-mono text-xs text-[#1e3a8a]">
              {JSON.stringify(toolCall.args, null, 2)}
            </div>
          </div>

          {toolResult && (
            <div>
              <div className="mb-1 text-xs font-medium text-[#1d4ed8]">
                Output:
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-white/70 bg-white/60 p-2 font-mono text-xs text-[#1e3a8a]">
                {JSON.stringify(toolResult.result, null, 2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
