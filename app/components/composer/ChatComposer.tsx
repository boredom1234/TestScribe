import React from "react";
import { ModelSelector } from './ModelSelector';
import { AttachmentManager } from './AttachmentManager';
import { IconArrowUp, IconTools } from '../ui/icons';

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

export function ChatComposer({ 
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
  onDomExtractPaste
}: ChatComposerProps) {
  const composerRef = React.useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(input);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const text = e.clipboardData?.getData('text') || '';
      if (!text) return;
      const obj = JSON.parse(text);
      if (obj && obj.dom_insp_extr_data_json === true) {
        // Intercept paste and turn into attachment
        e.preventDefault();
        const filename = `dom_extract_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const file = new File([JSON.stringify(obj)], filename, { type: 'application/json' });
        onDomExtractPaste(file);
      }
    } catch {
      // Not JSON; fall through to normal paste
    }
  };

  return (
    <section className="mx-auto mt-10 w-full max-w-3xl">
      <div className="input-bar" ref={composerRef}>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Type your message here..."
              className="h-[68px] w-full resize-none rounded-l-2xl border border-transparent bg-[#FBF7FB] px-4 py-3 text-[#432A78] placeholder-[#6F4DA3] outline-none"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-rose-700">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={onModelChange}
              />
              <button 
                onClick={onOpenToolsModal}
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
              <AttachmentManager
                attachments={attachments}
                onAttachmentsChange={onAttachmentsChange}
                onPreviewAttachment={onPreviewAttachment}
              />
            </div>
          </div>
          <button 
            aria-label="Send" 
            onClick={() => onSendMessage(input)} 
            className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-rose-800 to-pink-800 text-white shadow-md transition hover:from-rose-600 hover:to-pink-600"
          >
            <IconArrowUp />
          </button>
        </div>
      </div>
    </section>
  );
}
