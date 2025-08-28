import React from "react";
import { ChatMessage } from "../../types/chat";
import { IconCopy, IconBranch, IconRefresh } from "../ui/icons";

interface MessageActionsProps {
  message: ChatMessage;
  onCopy: () => void;
  onBranchOff: () => void;
  onRetry: () => void;
}

export function MessageActions({
  message,
  onCopy,
  onBranchOff,
  onRetry,
}: MessageActionsProps) {
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
          style={{ color: "#432A78" }}
          title={copied ? "Copied!" : "Copy message"}
        >
          <IconCopy />
        </button>

        <button
          onClick={onBranchOff}
          className="p-1.5 rounded-md hover:bg-rose-100/40 transition-colors hover:text-[#432A78]"
          style={{ color: "#432A78" }}
          title="Branch off to new conversation with different model"
        >
          <IconBranch />
        </button>

        <button
          onClick={onRetry}
          className="p-1.5 rounded-md hover:bg-rose-100/40 transition-colors hover:text-[#432A78]"
          style={{ color: "#432A78" }}
          title="Retry message"
        >
          <IconRefresh />
        </button>
      </div>

      <div
        className="flex items-center gap-3 font-medium"
        style={{ color: "#432A78" }}
      >
        {message.model && <span className="text-xs">{message.model}</span>}
        {message.tokensPerSecond && (
          <span className="text-xs">
            {message.tokensPerSecond.toFixed(2)} tok/sec
          </span>
        )}
        {message.totalTokens && (
          <span className="text-xs">{message.totalTokens} tokens</span>
        )}
        {message.timeToFirstToken && (
          <span className="text-xs">
            Time-to-First: {formatDuration(message.timeToFirstToken)}
          </span>
        )}
      </div>
    </div>
  );
}
