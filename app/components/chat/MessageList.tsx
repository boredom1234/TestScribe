import React from "react";
import { ChatMessage, AttachmentMeta } from "../../types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  composerHeight: number;
  onCopy: () => void;
  onBranchOff: (message: ChatMessage) => void;
  onRetry: (message: ChatMessage) => void;
  onPreviewAttachment: (att: AttachmentMeta) => void;
  onEditUser: (message: ChatMessage, newText: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  composerHeight,
  onCopy,
  onBranchOff,
  onRetry,
  onPreviewAttachment,
  onEditUser,
}: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className="mx-auto mt-6 w-full max-w-3xl flex-1"
      style={{ paddingBottom: composerHeight + 24 }}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCopy={onCopy}
            onBranchOff={onBranchOff}
            onRetry={onRetry}
            onPreviewAttachment={onPreviewAttachment}
            onEditUser={onEditUser}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-[#eff6ff] px-4 py-3">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
