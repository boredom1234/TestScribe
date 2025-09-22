import React from "react";
import { useApiKeys } from "@/app/hooks/useApiKeys";
import { ModelSelector } from "./ModelSelector";
import { AttachmentManager } from "./AttachmentManager";
import { IconArrowUp, IconTools } from "../ui/icons";
import { IconPlusSparkles } from "../ui/icons/IconPlusSparkles";

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  attachments: File[];
  onAttachmentsChange: (files: File[]) => void;
  onPreviewAttachment: (file: File) => void;
  selectedTools: string[];
  onOpenToolsModal: () => void;
  onDomExtractPaste: (file: File) => void;
}

export const ChatComposer = React.forwardRef<HTMLDivElement, ChatComposerProps>(
  function ChatComposer(
    {
      input,
      onInputChange,
      onSendMessage,
      selectedModel,
      onModelChange,
      attachments,
      onAttachmentsChange,
      onPreviewAttachment,
      selectedTools,
      onOpenToolsModal,
      onDomExtractPaste,
    }: ChatComposerProps,
    ref
  ) {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [isFormatting, setIsFormatting] = React.useState(false);
    const { apiKeys } = useApiKeys();

    // Auto-resize textarea up to a max height, then enable vertical scrolling
    const MAX_TEXTAREA_HEIGHT = 240; // px
    React.useEffect(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      // Reset height to measure scrollHeight correctly, then clamp to max
      ta.style.height = "auto";
      const newHeight = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT);
      ta.style.height = `${newHeight}px`;
      ta.style.overflowY =
        ta.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }, [input]);

    const setSelectionSafely = (start: number, end: number) => {
      const ta = textareaRef.current;
      if (!ta) return;
      // Defer to next tick to account for controlled re-render
      setTimeout(() => {
        try {
          ta.setSelectionRange(start, end);
        } catch {}
      }, 0);
    };

    const handleImprovePrompt = async () => {
      const text = (input || "").trim();
      if (!text || isFormatting) return;
      setIsFormatting(true);
      try {
        const prePrompt = [
          "STRICT FORMATTER MODE:",
          "- Only rewrite the user's text for clarity and structure.",
          "- Do NOT add new information, assumptions, or examples.",
          "- Do NOT answer the prompt or provide commentary.",
          "- Preserve the user's intent and technical details.",
          "- Output ONLY the improved prompt text (no preamble/explanation).",
        ].join("\n");

        const res = await fetch("/api/format", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: input, model: selectedModel, prePrompt, keys: apiKeys }),
        });
        const data = await res.json().catch(() => ({ text: "" }));
        const newText = typeof data?.text === "string" ? data.text : "";
        if (newText) {
          onInputChange(newText);
          const caret = newText.length;
          setSelectionSafely(caret, caret);
        }
      } catch {
      } finally {
        setIsFormatting(false);
      }
    };

    const wrapSelection = (
      before: string,
      after: string,
      placeholder: string
    ) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const value = input;
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? 0;
      const selected = value.slice(start, end);
      const hasWrap =
        selected.startsWith(before) &&
        selected.endsWith(after) &&
        selected.length >= before.length + after.length;

      let newValue: string;
      let selStart: number;
      let selEnd: number;

      if (end > start) {
        if (hasWrap) {
          // Unwrap
          const inner = selected.slice(
            before.length,
            selected.length - after.length
          );
          newValue = value.slice(0, start) + inner + value.slice(end);
          selStart = start;
          selEnd = start + inner.length;
        } else {
          // Wrap selection
          newValue =
            value.slice(0, start) +
            before +
            selected +
            after +
            value.slice(end);
          selStart = start + before.length;
          selEnd = selStart + selected.length;
        }
      } else {
        // No selection: insert placeholder wrapped
        const wrapped = before + placeholder + after;
        newValue = value.slice(0, start) + wrapped + value.slice(end);
        // Highlight placeholder
        selStart = start + before.length;
        selEnd = selStart + placeholder.length;
      }

      onInputChange(newValue);
      setSelectionSafely(selStart, selEnd);
    };

    const insertText = (text: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const value = input;
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? 0;
      const newValue = value.slice(0, start) + text + value.slice(end);
      const caret = start + text.length;
      onInputChange(newValue);
      setSelectionSafely(caret, caret);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (unless Shift held)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSendMessage(input);
        // Clear input
        onInputChange("");
        return;
      }

      // Insert indentation on Tab
      if (e.key === "Tab") {
        e.preventDefault();
        insertText("  ");
        return;
      }

      // Markdown formatting hotkeys
      const meta = e.ctrlKey || e.metaKey;
      if (meta) {
        const key = e.key.toLowerCase();
        if (key === "b") {
          e.preventDefault();
          wrapSelection("**", "**", "bold");
          return;
        }
        if (key === "i") {
          e.preventDefault();
          wrapSelection("*", "*", "italic");
          return;
        }
        if (key === "e") {
          // inline code
          e.preventDefault();
          wrapSelection("`", "`", "code");
          return;
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      try {
        const text = e.clipboardData?.getData("text") || "";
        if (!text) return;
        const obj = JSON.parse(text);
        if (obj && obj.dom_insp_extr_data_json === true) {
          // Intercept paste and turn into attachment
          e.preventDefault();
          const filename = `dom_extract_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.json`;
          const file = new File([JSON.stringify(obj)], filename, {
            type: "application/json",
          });
          onDomExtractPaste(file);
        }
      } catch {
        // Not JSON; fall through to normal paste
      }
    };

    return (
      <section className="mx-auto mt-10 w-full max-w-3xl">
        <div className="input-bar" ref={ref}>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                ref={textareaRef}
                placeholder="Type your message here..."
                className="min-h-[68px] max-h-[240px] w-full resize-none rounded-xl border border-transparent bg-[#facff1a] px-4 py-3 text-[#1e3a8a] placeholder-[#60a5fa] outline-none overflow-y-auto"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-blue-700">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                />
                <button
                  onClick={onOpenToolsModal}
                  className={`inline-flex items-center gap-1 rounded-full border border-blue-200/60 px-2.5 py-1 font-medium transition ${
                    selectedTools.length > 0
                      ? "bg-[#2563eb] text-white border-[#2563eb] hover:bg-[#2563eb]/90"
                      : "bg-white/70 hover:bg-white"
                  }`}
                >
                  <span
                    className={
                      selectedTools.length > 0 ? "text-white" : "text-blue-500"
                    }
                  >
                    <IconTools />
                  </span>
                  Tools{" "}
                  {selectedTools.length > 0 && `(${selectedTools.length})`}
                </button>
                <AttachmentManager
                  attachments={attachments}
                  onAttachmentsChange={onAttachmentsChange}
                  onPreviewAttachment={onPreviewAttachment}
                />
              </div>
            </div>
            {input.trim().length > 0 && (
              <button
                aria-label="Improve prompt"
                onClick={handleImprovePrompt}
                disabled={isFormatting}
                aria-busy={isFormatting}
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-md transition ${
                  isFormatting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:from-blue-700 hover:to-blue-500"
                }`}
                title={
                  isFormatting ? "Formatting…" : "Improve prompt formatting"
                }
              >
                {isFormatting ? (
                  // Spinner icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" strokeOpacity="0.9" />
                  </svg>
                ) : (
                  <IconPlusSparkles />
                )}
              </button>
            )}
            <button
              aria-label="Send"
              onClick={() => onSendMessage(input)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-md transition hover:from-blue-700 hover:to-blue-500"
            >
              <IconArrowUp />
            </button>
          </div>
        </div>
      </section>
    );
  }
);
