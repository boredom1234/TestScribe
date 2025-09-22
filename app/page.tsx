"use client";

import React from "react";
import { AttachmentMeta, FrameworkContextKey, ChatMessage } from "./types/chat";
import { Sidebar } from "./components/sidebar/Sidebar";
import { MobileSidebar } from "./components/sidebar/MobileSidebar";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { MessageList } from "./components/chat/MessageList";
import { ChatComposer } from "./components/composer/ChatComposer";
import { ToolsModal } from "./components/modals/ToolsModal";
import { AttachmentPreviewModal } from "./components/modals/AttachmentPreviewModal";
import { IconArrowUp, IconHamburger } from "./components/ui/icons";
import { IconCircleFadingPlus } from "./components/ui/icons/IconCircleFadingPlus";
import { IconClose } from "./components/ui/icons/IconClose";
import { useChat } from "./hooks/useChat";
import { useAttachments } from "./hooks/useAttachments";
import { useTools } from "./hooks/useTools";
import { useApiKeys } from "./hooks/useApiKeys";
import { ApiKeysModal } from "./components/modals/ApiKeysModal";

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
    editUserMessage,
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
  const [animatedTokens, setAnimatedTokens] = React.useState(0);
  const animRef = React.useRef<number | null>(null);
  const displayedRef = React.useRef(0);

  const composerRef = React.useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

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
  // BYOK modal state and keys
  const [isKeysModalOpen, setIsKeysModalOpen] = React.useState(false);
  const { apiKeys, hasAnyKey } = useApiKeys();
  const keysCount = React.useMemo(() => {
    return Object.values(apiKeys || {}).filter((v) => !!(v && v.length)).length;
  }, [apiKeys]);

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

  const handleEditUserMessage = (message: ChatMessage, newText: string) => {
    // For edits, we reuse the original message attachments inside useChat.editUserMessage
    // and only need to forward the selected tools.
    editUserMessage(message, newText, selectedTools);
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

  // Show a floating "scroll to bottom" button when far from bottom
  React.useEffect(() => {
    function updateVisibility() {
      const doc = document.documentElement;
      const distanceFromBottom =
        doc.scrollHeight - (window.scrollY + window.innerHeight);
      // Show if more than a threshold away from bottom; consider composer height
      const threshold = Math.max(200, composerHeight);
      setShowScrollToBottom(distanceFromBottom > threshold);
    }
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    updateVisibility();
    return () => {
      window.removeEventListener("scroll", updateVisibility as any);
      window.removeEventListener("resize", updateVisibility as any);
    };
  }, [composerHeight]);

  // Animate token counter when totalThreadTokens changes
  React.useEffect(() => {
    const to = totalThreadTokens ?? 0;
    const from = displayedRef.current;
    const duration = 600; // ms
    const start = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = from + (to - from) * eased;
      displayedRef.current = val;
      setAnimatedTokens(val);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
  }, [totalThreadTokens]);

  const showWelcome = (activeThread?.messages.length ?? 0) === 0;
  const attachedCount = activeThread?.attachedContexts?.length ?? 0;
  // Token severity visualization (0..1,000,000 split in ~90,909 steps)
  const tokenCount = totalThreadTokens ?? 0;
  const tokenLevel = Math.min(11, Math.floor(tokenCount / 90909));
  const levelInfo = [
    { emoji: "🟢", label: "Green" },
    { emoji: "🟡", label: "Greenish-Yellow" },
    { emoji: "🟡", label: "Yellow-Green" },
    { emoji: "🟡", label: "Yellow" },
    { emoji: "🟠", label: "Yellow-Orange" },
    { emoji: "🟠", label: "Orange" },
    { emoji: "🟠", label: "Reddish-Orange" },
    { emoji: "🔴", label: "Orange-Red" },
    { emoji: "🔴", label: "Red" },
    { emoji: "🔴", label: "Darker Red" },
    { emoji: "🔴", label: "Deep Red" },
    { emoji: "⚫", label: "Maroon/Very Dark Red" },
  ] as const;
  const levelLabel = levelInfo[tokenLevel].label;
  const chipColors =
    tokenLevel === 0
      ? { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" }
      : tokenLevel <= 3
        ? { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800" }
        : tokenLevel <= 6
          ? { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800" }
          : tokenLevel <= 10
            ? { bg: "bg-red-50", border: "border-red-200", text: "text-red-800" }
            : { bg: "bg-red-100", border: "border-red-300", text: "text-red-900" };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setInput("");

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

  const scrollToBottom = () => {
    const doc = document.documentElement;
    window.scrollTo({ top: doc.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="font-sans min-h-screen w-full bg-[#f8fbff]">
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
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#dbeafe] text-[#1e3a8a] shadow-sm hover:brightness-95"
        >
          <IconHamburger />
        </button>
      </div>

      {/* Top-right controls: Keys + Contexts */}
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
        {/* Manage API Keys */}
        <div className="relative">
          <button
            aria-label="Manage API Keys"
            onClick={() => setIsKeysModalOpen(true)}
            className="px-3 h-9 rounded-lg bg-[#dbeafe] text-[#1e3a8a] shadow-sm hover:brightness-95 text-xs font-medium"
            title="Bring Your Own Keys (BYOK)"
          >
            {hasAnyKey ? "Keys ✓" : "Keys"}
          </button>
          {keysCount > 0 && (
            <span
              className="absolute -top-1 -right-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-[#10b981] px-1 text-[8px] font-semibold text-white border border-white shadow"
              title={`${keysCount} key${keysCount === 1 ? "" : "s"} set`}
            >
              {keysCount}
            </span>
          )}
        </div>
        {/* Context attach menu */}
        <div className="relative" ref={contextMenuRef}>
          <button
            aria-label="Attach framework contexts"
            onClick={toggleContextMenu}
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#dbeafe] text-[#1e3a8a] shadow-sm hover:brightness-95"
            title="Attach Playwright / Selenium / Cypress docs to guide the model"
          >
            {isContextMenuOpen ? <IconClose /> : <IconCircleFadingPlus />}
          </button>
          {attachedCount > 0 && (
            <span
              className="absolute -top-1 -right-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-[#2563eb] px-1 text-[8px] font-semibold text-white border border-white shadow"
              title={`${attachedCount} context${attachedCount === 1 ? "" : "s"} attached`}
            >
              {attachedCount}
            </span>
          )}
          {isContextMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-blue-200 bg-white p-3 shadow-lg">
              <div className="mb-2 text-sm font-semibold text-[#1e3a8a]">
                Framework Contexts <small><sup><span className="text-[#008000]">powered by Context 7</span></sup></small>
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
              onEditUser={handleEditUserMessage}
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

      {/* API Keys Modal */}
      <ApiKeysModal isOpen={isKeysModalOpen} onClose={() => setIsKeysModalOpen(false)} />

      {/* Thread Token Counter - bottom right */}
      {activeThread && activeThread.messages.length > 0 && totalThreadTokens > 0 && (
        <div className="fixed bottom-3 right-3 z-40">
          <div
            className={`rounded-lg ${chipColors.bg} border ${chipColors.border} px-3 py-2 text-xs font-medium ${chipColors.text} shadow-sm w-[max-content]`}
            title={`${levelLabel} level`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono">{Math.round(animatedTokens).toLocaleString()}</span>
              <span>total token count</span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Bottom Button - bottom right */}
      {!showWelcome && !!(activeThread && activeThread.messages.length > 0) && showScrollToBottom && (
        <div className={`fixed ${!!(activeThread && activeThread.messages.length > 0 && totalThreadTokens > 0) ? "bottom-14" : "bottom-3"} right-3 z-50`}>
          <button
            aria-label="Scroll to bottom"
            onClick={scrollToBottom}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#dbeafe] text-[#1e3a8a] border border-blue-200 shadow-sm hover:brightness-95"
            title="Go to latest message"
          >
            <span className="block rotate-180">
              <IconArrowUp />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
