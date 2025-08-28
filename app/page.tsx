"use client";

import React from "react";
import { Category, AttachmentMeta } from './types/chat';
import { Sidebar } from './components/sidebar/Sidebar';
import { MobileSidebar } from './components/sidebar/MobileSidebar';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { MessageList } from './components/chat/MessageList';
import { ChatComposer } from './components/composer/ChatComposer';
import { ToolsModal } from './components/modals/ToolsModal';
import { AttachmentPreviewModal } from './components/modals/AttachmentPreviewModal';
import { IconHamburger } from './components/ui/icons';
import { useChat } from './hooks/useChat';
import { useAttachments } from './hooks/useAttachments';
import { useTools } from './hooks/useTools';

export default function Home() {
  const {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    selectedModel,
    setSelectedModel,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isLoading,
    sendMessage,
    startNewChat,
    deleteThread,
    renameThread,
    branchOff,
    retryMessage
  } = useChat();

  const {
    attachments,
    setAttachments,
    addAttachments,
    previewContent,
    previewName,
    isPreviewOpen,
    openPreview,
    openPreviewContent,
    openPreviewNameOnly,
    closePreview,
    preparePayload
  } = useAttachments();

  const {
    selectedTools,
    setSelectedTools,
    isToolsModalOpen,
    openToolsModal,
    closeToolsModal
  } = useTools();

  const [input, setInput] = React.useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category>("create");
  const [composerHeight, setComposerHeight] = React.useState<number>(160);
  
  const composerRef = React.useRef<HTMLDivElement | null>(null);

  // Measure composer height so content never sits under it
  React.useEffect(() => {
    function measure() {
      const h = composerRef.current?.offsetHeight ?? 160;
      setComposerHeight(h);
    }
    measure();
    window.addEventListener("resize", measure);
    // Observe dynamic height changes (e.g., attachments, model selector)
    const el = composerRef.current;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  const showWelcome = (activeThread?.messages.length ?? 0) === 0 && input.trim().length === 0;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const attachmentsPayload = await preparePayload(attachments);
    await sendMessage(text, selectedTools, attachmentsPayload);
    setInput("");
    setAttachments([]);
  };

  const handleRetryMessage = async (message: any) => {
    const attachmentsPayload = await preparePayload(attachments);
    retryMessage(message, selectedTools, attachmentsPayload);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleCopyMessage = () => {
    // Copy functionality is handled within MessageActions component
  };

  const handleDomExtractPaste = (file: File) => {
    addAttachments([file]);
  };

  const handlePreviewAttachment = (att: AttachmentMeta) => {
    if (att.content) {
      const isJson = (att.type === 'application/json') || att.name.toLowerCase().endsWith('.json');
      if (isJson) {
        try {
          const pretty = JSON.stringify(JSON.parse(att.content), null, 2);
          openPreviewContent(att.name, pretty);
          return;
        } catch {}
      }
      openPreviewContent(att.name, att.content);
    } else {
      openPreviewNameOnly(att.name);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="font-sans min-h-screen w-full bg-[#fdf7fd]">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={startNewChat}
        onDeleteThread={deleteThread}
        onRenameThread={renameThread}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={startNewChat}
        onDeleteThread={deleteThread}
        onRenameThread={renameThread}
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
          {/* Welcome Screen */}
          {showWelcome && (
            <WelcomeScreen
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onSuggestionClick={handleSuggestionClick}
              hasMessages={(activeThread?.messages.length ?? 0) > 0}
            />
          )}

          {/* Messages */}
          {activeThread && (
            <MessageList
              messages={activeThread.messages}
              isLoading={isLoading}
              composerHeight={composerHeight}
              onCopy={handleCopyMessage}
              onBranchOff={branchOff}
              onRetry={handleRetryMessage}
              onPreviewAttachment={handlePreviewAttachment}
            />
          )}

          {/* Chat Composer */}
          <ChatComposer
            ref={composerRef}
            input={input}
            onInputChange={setInput}
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onPreviewAttachment={openPreview}
            selectedTools={selectedTools}
            onOpenToolsModal={openToolsModal}
            onDomExtractPaste={handleDomExtractPaste}
          />
        </div>
      </div>

      {/* Tools Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={closeToolsModal}
        selectedTools={selectedTools}
        onSelectedToolsChange={setSelectedTools}
      />

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        fileName={previewName}
        content={previewContent}
      />

    </div>
  );
}
