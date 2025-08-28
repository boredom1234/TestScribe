import React from "react";
import { Modal } from './Modal';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  content: string | null;
}

export function AttachmentPreviewModal({ 
  isOpen, 
  onClose, 
  fileName, 
  content 
}: AttachmentPreviewModalProps) {
  const footer = (
    <button
      onClick={onClose}
      className="inline-flex items-center justify-center px-6 py-2 bg-[#aa4673] text-white rounded-lg hover:bg-[#aa4673]/90 transition leading-none"
    >
      Close
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName || 'Attachment Preview'}
      footer={footer}
    >
      {content ? (
        <pre className="whitespace-pre-wrap break-words text-sm font-mono text-[#432A78] bg-gray-50 border border-gray-200 rounded-lg p-4">
          {content}
        </pre>
      ) : (
        <div className="text-gray-500 text-sm">No preview available.</div>
      )}
    </Modal>
  );
}
