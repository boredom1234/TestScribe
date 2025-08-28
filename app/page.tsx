"use client";

import React from "react";
import { AttachmentMeta, FrameworkContextKey } from "./types/chat";
import { Sidebar } from "./components/sidebar/Sidebar";
import { MobileSidebar } from "./components/sidebar/MobileSidebar";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { MessageList } from "./components/chat/MessageList";
import { ChatComposer } from "./components/composer/ChatComposer";
import { ToolsModal } from "./components/modals/ToolsModal";
import { AttachmentPreviewModal } from "./components/modals/AttachmentPreviewModal";
import { IconHamburger } from "./components/ui/icons";
import { IconCircleFadingPlus } from "./components/ui/icons/IconCircleFadingPlus";
import { IconClose } from "./components/ui/icons/IconClose";
import { useChat } from "./hooks/useChat";
import { useAttachments } from "./hooks/useAttachments";
import { useTools } from "./hooks/useTools";

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
    retryMessage,
    totalThreadTokens,
    markContextsAttached,
    isContextAttached,
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
    preparePayload,
  } = useAttachments();

  const {
    selectedTools,
    setSelectedTools,
    isToolsModalOpen,
    openToolsModal,
    closeToolsModal,
  } = useTools();

  const [input, setInput] = React.useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [composerHeight, setComposerHeight] = React.useState<number>(160);

  const composerRef = React.useRef<HTMLDivElement | null>(null);

  // External context selection and data store
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
  const [contextSelections, setContextSelections] = React.useState({
    playwright: false,
    selenium: false,
    cypress: false,
  });
  const [contextData, setContextData] = React.useState<Record<string, string>>(
    {},
  );
  const contextMenuRef = React.useRef<HTMLDivElement | null>(null);

  const toggleContextMenu = () => setIsContextMenuOpen((v) => !v);

  const fetchAndStoreContext = async (
    key: "playwright" | "selenium" | "cypress",
  ) => {
    try {
      const res = await fetch(`/api/context?key=${key}`, { cache: "no-store" });
      const text = await res.text();
      setContextData((prev) => ({ ...prev, [key]: text }));
    } catch (e) {
      setContextData((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleToggleContext = async (
    key: "playwright" | "selenium" | "cypress",
  ) => {
    // Prevent enabling if already attached for this thread
    if (isContextAttached(key)) return;
    setContextSelections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    // Fetch on enable
    const willEnable = !contextSelections[key];
    if (willEnable && !contextData[key]) {
      await fetchAndStoreContext(key);
    }
  };

  // Close context menu on outside click or Escape
  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!isContextMenuOpen) return;
      const el = contextMenuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setIsContextMenuOpen(false);
      }
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsContextMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [isContextMenuOpen]);

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
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  const showWelcome = (activeThread?.messages.length ?? 0) === 0;
  const attachedCount = activeThread?.attachedContexts?.length ?? 0;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const attachmentsPayload = await preparePayload(attachments);
    // Merge in selected external contexts as virtual attachments
    const externalContexts: any[] = [];
    const keysToAttach: FrameworkContextKey[] = [];
    if (
      contextSelections.playwright &&
      contextData.playwright &&
      !isContextAttached("playwright")
    ) {
      externalContexts.push({
        name: "Playwright Context",
        size: contextData.playwright.length,
        type: "text/plain",
        content: contextData.playwright,
        externalContext: true,
      });
      keysToAttach.push("playwright");
    }
    if (
      contextSelections.selenium &&
      contextData.selenium &&
      !isContextAttached("selenium")
    ) {
      externalContexts.push({
        name: "Selenium Context",
        size: contextData.selenium.length,
        type: "text/plain",
        content: contextData.selenium,
        externalContext: true,
      });
      keysToAttach.push("selenium");
    }
    if (
      contextSelections.cypress &&
      contextData.cypress &&
      !isContextAttached("cypress")
    ) {
      externalContexts.push({
        name: "Cypress Context",
        size: contextData.cypress.length,
        type: "text/plain",
        content: contextData.cypress,
        externalContext: true,
      });
      keysToAttach.push("cypress");
    }
    const mergedAttachments = [...attachmentsPayload, ...externalContexts];

    await sendMessage(text, selectedTools, mergedAttachments);
    if (keysToAttach.length) {
      markContextsAttached(keysToAttach);
      setContextSelections((prev) => {
        const next = { ...prev } as typeof prev;
        for (const k of keysToAttach) next[k] = false;
        return next;
      });
    }
    setInput("");
    setAttachments([]);
  };

  const handleRetryMessage = async (message: any) => {
    const attachmentsPayload = await preparePayload(attachments);
    const externalContexts: any[] = [];
    const keysToAttach: FrameworkContextKey[] = [];
    if (
      contextSelections.playwright &&
      contextData.playwright &&
      !isContextAttached("playwright")
    ) {
      externalContexts.push({
        name: "Playwright Context",
        size: contextData.playwright.length,
        type: "text/plain",
        content: contextData.playwright,
        externalContext: true,
      });
      keysToAttach.push("playwright");
    }
    if (
      contextSelections.selenium &&
      contextData.selenium &&
      !isContextAttached("selenium")
    ) {
      externalContexts.push({
        name: "Selenium Context",
        size: contextData.selenium.length,
        type: "text/plain",
        content: contextData.selenium,
        externalContext: true,
      });
      keysToAttach.push("selenium");
    }
    if (
      contextSelections.cypress &&
      contextData.cypress &&
      !isContextAttached("cypress")
    ) {
      externalContexts.push({
        name: "Cypress Context",
        size: contextData.cypress.length,
        type: "text/plain",
        content: contextData.cypress,
        externalContext: true,
      });
      keysToAttach.push("cypress");
    }
    const mergedAttachments = [...attachmentsPayload, ...externalContexts];
    retryMessage(message, selectedTools, mergedAttachments);
    if (keysToAttach.length) {
      markContextsAttached(keysToAttach);
      setContextSelections((prev) => {
        const next = { ...prev } as typeof prev;
        for (const k of keysToAttach) next[k] = false;
        return next;
      });
    }
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
      const isJson =
        att.type === "application/json" ||
        att.name.toLowerCase().endsWith(".json");
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

      {/* Context attach menu - top right */}
      <div className="fixed right-3 top-3 z-50">
        <div className="relative" ref={contextMenuRef}>
          <button
            aria-label="Attach framework contexts"
            onClick={toggleContextMenu}
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5dbef] text-[#ca0277] shadow-sm hover:brightness-95"
            title="Attach Playwright / Selenium / Cypress docs to guide the model"
          >
            {isContextMenuOpen ? <IconClose /> : <IconCircleFadingPlus />}
          </button>
          {attachedCount > 0 && (
            <span
              className="absolute -top-1 -right-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-[#ca0277] px-1 text-[8px] font-semibold text-white border border-white shadow"
              title={`${attachedCount} context${attachedCount === 1 ? "" : "s"} attached`}
            >
              {attachedCount}
            </span>
          )}
          {isContextMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[#e9c7e0] bg-white p-3 shadow-lg">
              <div className="mb-2 text-sm font-semibold text-[#8a0254]">
                Framework Contexts
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!contextSelections.playwright || isContextAttached("playwright")}
                    disabled={isContextAttached("playwright")}
                    onChange={() => handleToggleContext("playwright")}
                  />
                  <span className="flex-1">Playwright</span>
                  <span className="text-[10px] text-gray-500">
                    {isContextAttached("playwright")
                      ? "already attached"
                      : contextData.playwright
                        ? "fetched"
                        : contextSelections.playwright
                          ? "loading…"
                          : ""}
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!contextSelections.selenium || isContextAttached("selenium")}
                    disabled={isContextAttached("selenium")}
                    onChange={() => handleToggleContext("selenium")}
                  />
                  <span className="flex-1">Selenium</span>
                  <span className="text-[10px] text-gray-500">
                    {isContextAttached("selenium")
                      ? "already attached"
                      : contextData.selenium
                        ? "fetched"
                        : contextSelections.selenium
                          ? "loading…"
                          : ""}
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!contextSelections.cypress || isContextAttached("cypress")}
                    disabled={isContextAttached("cypress")}
                    onChange={() => handleToggleContext("cypress")}
                  />
                  <span className="flex-1">Cypress</span>
                  <span className="text-[10px] text-gray-500">
                    {isContextAttached("cypress")
                      ? "already attached"
                      : contextData.cypress
                        ? "fetched"
                        : contextSelections.cypress
                          ? "loading…"
                          : ""}
                  </span>
                </label>
              </div>
              <div className="mt-3 text-[11px] text-gray-500">
                Selected contexts will be sent with your next message to guide
                the model.
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={
          "mx-auto flex gap-6 p-4 sm:p-6 lg:py-8 justify-center transition-all duration-300"
        }
      >
        <div className="w-full space-y-6 px-2 pt-8 duration-300 animate-in fade-in-50 zoom-in-90 sm:px-8 pt-18">
          {/* Welcome Screen */}
          {showWelcome && (
            <WelcomeScreen
              onSuggestionClick={handleSuggestionClick}
              hasMessages={(activeThread?.messages.length ?? 0) > 0}
              contextSelections={contextSelections}
              onToggleContext={handleToggleContext}
              isContextAttached={isContextAttached}
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

      {/* Thread Token Counter - bottom right */}
      {activeThread && activeThread.messages.length > 0 && totalThreadTokens > 0 && (
        <div className="fixed bottom-3 right-3 z-40">
          <div className="rounded-full bg-white/90 border border-rose-200 px-3 py-1 text-xs font-medium text-[#432A78] shadow-sm">
            {totalThreadTokens} token count
          </div>
        </div>
      )}
    </div>
  );
}
