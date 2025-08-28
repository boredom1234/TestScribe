import React from "react";
import { IconPaperclip } from "../ui/icons";

interface AttachmentManagerProps {
  attachments: File[];
  onAttachmentsChange: (files: File[]) => void;
  onPreviewAttachment: (file: File) => void;
}

export function AttachmentManager({
  attachments,
  onAttachmentsChange,
  onPreviewAttachment,
}: AttachmentManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onAttachmentsChange([...attachments, ...files]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 font-medium hover:bg-white"
      >
        <span className="text-rose-500">
          <IconPaperclip />
        </span>
        Attach
      </button>

      {attachments.length > 0 && (
        <div className="mt-2 basis-full w-full flex flex-wrap items-center gap-2 text-[11px] text-rose-900/90">
          {attachments.map((file, idx) => (
            <span
              key={`${file.name}-${idx}`}
              role="button"
              tabIndex={0}
              title="Click to preview"
              onClick={() => onPreviewAttachment(file)}
              className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 cursor-pointer hover:bg-white"
            >
              {file.name}
              <button
                aria-label="Remove attachment"
                className="ml-1 text-rose-500 hover:text-rose-700"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(idx);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
