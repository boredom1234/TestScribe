import React from "react";
import ReactMarkdown from 'react-markdown';
import { ChatMessage, AttachmentMeta } from '../../types/chat';
import { MessageActions } from './MessageActions';
import { ToolCallComponent } from './ToolCallComponent';
import { IconPaperclip } from '../ui/icons';

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: () => void;
  onBranchOff: (message: ChatMessage) => void;
  onRetry: (message: ChatMessage) => void;
  onPreviewAttachment: (att: AttachmentMeta) => void;
}

export function MessageBubble({ 
  message, 
  onCopy, 
  onBranchOff, 
  onRetry,
  onPreviewAttachment,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${message.role === "user" ? "flex justify-end" : ""}`}>
        {/* Tool calls (only for assistant messages) */}
        {message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-3 w-full">
            {message.toolCalls.map((toolCall) => {
              const toolResult = message.toolResults?.find(tr => tr.toolCallId === toolCall.toolCallId);
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
        {message.content && (
          <div className="w-full">
            <div
              className={`${
                message.role === "user"
                  ? "bg-[#f5dbef] text-[#432A78]"
                  : "bg-[#fdf7fd] text-rose-900"
              } whitespace-pre-wrap rounded-2xl px-4 py-3`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-rose-900 prose-p:text-rose-900 prose-li:text-rose-900 prose-strong:text-rose-900 prose-code:text-rose-800 prose-code:bg-rose-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-rose-100 prose-pre:text-rose-800">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>

            {/* Attachment chips (only for user messages with attachments) */}
            {message.role === "user" && Array.isArray(message.attachments) && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-rose-900/90">
                {message.attachments.map((att, idx) => (
                  <span
                    key={`${att.name}-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onPreviewAttachment(att)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 cursor-pointer hover:bg-white"
                  >
                    <span className="text-rose-500"><IconPaperclip /></span>
                    {att.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Message Actions - only for assistant messages */}
            {message.role === "assistant" && (
              <MessageActions
                message={message}
                onCopy={onCopy}
                onBranchOff={() => onBranchOff(message)}
                onRetry={() => onRetry(message)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
