import React from "react";

export function useAttachments() {
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [previewContent, setPreviewContent] = React.useState<string | null>(
    null,
  );
  const [previewName, setPreviewName] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const addAttachments = (files: File[]) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  // Open preview directly from provided content (e.g., from message metadata)
  const openPreviewContent = (name: string, content: string) => {
    setPreviewName(name);
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  // Open preview by name only (no content available)
  const openPreviewNameOnly = (name: string) => {
    setPreviewName(name);
    setPreviewContent(null);
    setIsPreviewOpen(true);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  const openPreview = async (file: File) => {
    try {
      const name = file.name;
      const type = file.type || "";
      let content = "";

      if (
        type.startsWith("text/") ||
        type === "application/json" ||
        name.toLowerCase().endsWith(".json")
      ) {
        const raw = await file.text();
        try {
          if (
            type === "application/json" ||
            name.toLowerCase().endsWith(".json")
          ) {
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

      setPreviewName(name);
      setPreviewContent(content);
      setIsPreviewOpen(true);
    } catch {
      setPreviewName(file.name);
      setPreviewContent("Failed to read file for preview.");
      setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewContent(null);
    setPreviewName(null);
  };

  const preparePayload = async (files: File[]) => {
    const results: Array<{
      name: string;
      size: number;
      type: string;
      content?: string;
      domInspExtractData?: boolean;
    }> = [];
    for (const f of files) {
      const base = { name: f.name, size: f.size, type: f.type };
      if (
        f.type === "application/json" ||
        f.name.toLowerCase().endsWith(".json")
      ) {
        try {
          const text = await f.text();
          try {
            const parsed = JSON.parse(text);
            const isDom = parsed && parsed.dom_insp_extr_data_json === true;
            if (isDom) {
              const min = JSON.stringify(parsed);
              results.push({ ...base, content: min, domInspExtractData: true });
              continue;
            }
          } catch {}
          results.push(base);
          continue;
        } catch {
          results.push(base);
          continue;
        }
      }
      results.push(base);
    }
    return results;
  };

  return {
    attachments,
    setAttachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    previewContent,
    previewName,
    isPreviewOpen,
    openPreview,
    openPreviewContent,
    openPreviewNameOnly,
    closePreview,
    preparePayload,
  };
}
