"use client";

import React, { useEffect, useState } from "react";
import { ChatThread, Thread } from "./ChatThread";
import { IconPlus, IconChevronLeft, IconChevronRight } from "../ui/icons";

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onRenameThread,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  // Close pinned sidebar with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPinned(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const sortedThreads = filteredThreads.sort((a, b) => {
    const aLastMessage = a.messages[a.messages.length - 1];
    const bLastMessage = b.messages[b.messages.length - 1];
    const aTime = aLastMessage?.timestamp || 0;
    const bTime = bLastMessage?.timestamp || 0;
    return bTime - aTime; // Most recent first
  });

  // Grouping helper similar to Claude's sidebar sections
  const getSectionLabel = (timestamp?: number) => {
    if (!timestamp || timestamp >= Date.now()) return "Recent";
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (timestamp >= startOfToday) return "Today";
    if (timestamp >= startOfToday - ONE_DAY) return "Yesterday";
    if (timestamp >= startOfToday - 7 * ONE_DAY) return "Last 7 days";
    return "Older";
  };

  if (false && isCollapsed) {
    return (
      <div className="fixed left-0 top-0 h-full w-12 bg-[#eff6ff] border-r border-[#93c5fd]/20 z-40 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className="p-3 text-[#2563eb] hover:bg-[#eff6ff]/50 transition-colors"
          title="Expand sidebar"
        >
          <IconChevronRight />
        </button>

        <button
          onClick={onCreateThread}
          className="mx-2 mt-2 p-2 rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#eff6ff]/80 transition-colors"
          title="New chat"
        >
          <IconPlus />
        </button>
      </div>
    );
  }

  const panelOpenClass = isPinned
    ? "translate-x-0"
    : "-translate-x-full peer-hover:translate-x-0 hover:translate-x-0";

  return (
    <div className="fixed left-0 top-0 h-full z-[90] hidden md:block pointer-events-none">
      {/* Desktop toggle button (always visible) */}
      <button
        type="button"
        aria-label={isPinned ? "Close sidebar" : "Open sidebar"}
        aria-pressed={isPinned}
        onClick={() => setIsPinned((v) => !v)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-[92] pointer-events-auto grid place-items-center rounded-full bg-white/80 backdrop-blur px-2.5 py-2 text-[#2563eb] shadow ring-1 ring-[#93c5fd]/50 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
        title={isPinned ? "Close sidebar" : "Open sidebar"}
      >
        {isPinned ? <IconChevronLeft /> : <IconChevronRight />}
      </button>
      {/* Hover hotspot (tiny left edge area) */}
      <div className="peer absolute left-0 top-0 h-full w-2 md:w-3 pointer-events-auto" />

      {/* Slide-in overlay panel */}
      <div
        className={`absolute left-0 top-0 h-full w-80 bg-[#eff6ff] border-r border-[#93c5fd]/20 z-[91] flex flex-col transform ${panelOpenClass} transition-transform duration-200 ease-out shadow-lg pointer-events-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#93c5fd]/20">
          <h2 className="text-lg font-semibold text-[#1e3a8a]">Chats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateThread}
              className="p-2 rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#eff6ff]/80 transition-colors shadow-sm"
              title="New chat"
            >
              <IconPlus />
            </button>
            {isPinned && (
              <button
                onClick={() => setIsPinned(false)}
                className="p-2 text-[#1d4ed8] hover:bg-[#eff6ff]/50 rounded-lg transition-colors"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <IconChevronLeft />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#93c5fd]/20">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#93c5fd]/30 rounded-lg text-[#1e3a8a] placeholder-[#1d4ed8]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]/40"
          />
        </div>

        {/* Quick actions */}
        <div className="px-4 pt-3">
          <button
            onClick={onCreateThread}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#eff6ff]/80 transition-colors shadow-sm"
          >
            <IconPlus />
            New Chat
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedThreads.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <div className="text-[#1d4ed8]/60 text-sm">
                  No chats found matching "{searchQuery}"
                </div>
              ) : (
                <div className="text-[#1d4ed8]/60 text-sm">
                  No chats yet. Start a new conversation!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedThreads.map((thread, idx) => {
                const lastTs =
                  thread.messages[thread.messages.length - 1]?.timestamp;
                const section = getSectionLabel(lastTs);
                const prevThread = idx > 0 ? sortedThreads[idx - 1] : undefined;
                const prevTs =
                  prevThread?.messages[prevThread.messages.length - 1]
                    ?.timestamp;
                const prevSection = getSectionLabel(prevTs);
                const showHeader = idx === 0 || section !== prevSection;
                return (
                  <React.Fragment key={thread.id}>
                    {showHeader && (
                      <div className="sticky top-0 z-10 -mt-1 mb-1 py-1 px-1 bg-[#eff6ff]/90 backdrop-blur supports-[backdrop-filter]:bg-[#eff6ff]/70">
                        <div className="text-[10px] uppercase tracking-wide text-[#2563eb]/60 font-medium">
                          {section}
                        </div>
                      </div>
                    )}
                    <ChatThread
                      key={thread.id}
                      thread={thread}
                      isActive={thread.id === activeThreadId}
                      onSelect={onSelectThread}
                      onDelete={onDeleteThread}
                      onRename={onRenameThread}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#93c5fd]/20">
          <div className="text-xs text-[#1d4ed8]/60 text-center">
            {threads.length} chat{threads.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
