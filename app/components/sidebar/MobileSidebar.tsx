"use client";

import React from "react";
import { ChatThread, Thread } from "./ChatThread";
import { IconPlus, IconX } from "../ui/icons";

interface MobileSidebarProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onRenameThread,
  isOpen,
  onClose,
}: MobileSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

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
    return bTime - aTime;
  });

  // Grouping helper similar to Claude's sidebar sections
  const getSectionLabel = (timestamp?: number) => {
    if (!timestamp) return "Older";
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-[#fdf7fd] border-r border-[#ee81ca]/20 z-50 flex flex-col md:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#ee81ca]/20">
          <h2 className="text-lg font-semibold text-[#432A78]">Chats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onCreateThread();
                onClose();
              }}
              className="p-2 rounded-lg bg-[#f5dbef] text-[#ca0277] hover:bg-[#f5dbef]/80 transition-colors shadow-sm"
              title="New chat"
            >
              <IconPlus />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6F4DA3] hover:bg-[#f5dbef]/50 rounded-lg transition-colors"
              title="Close sidebar"
            >
              <IconX />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#ee81ca]/20">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#ee81ca]/30 rounded-lg text-[#432A78] placeholder-[#6F4DA3]/60 focus:outline-none focus:ring-2 focus:ring-[#ca0277]/20 focus:border-[#ca0277]/40"
          />
        </div>

        {/* Quick actions */}
        <div className="px-4 pt-3">
          <button
            onClick={() => {
              onCreateThread();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[#f5dbef] text-[#ca0277] hover:bg-[#f5dbef]/80 transition-colors shadow-sm"
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
                <div className="text-[#6F4DA3]/60 text-sm">
                  No chats found matching "{searchQuery}"
                </div>
              ) : (
                <div className="text-[#6F4DA3]/60 text-sm">
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
                      <div className="sticky top-0 z-10 -mt-1 mb-1 py-1 px-1 bg-[#fdf7fd]/90 backdrop-blur supports-[backdrop-filter]:bg-[#fdf7fd]/70">
                        <div className="text-[10px] uppercase tracking-wide text-[#6F4DA3]/60 font-medium">
                          {section}
                        </div>
                      </div>
                    )}
                    <ChatThread
                      key={thread.id}
                      thread={thread}
                      isActive={thread.id === activeThreadId}
                      onSelect={(threadId) => {
                        onSelectThread(threadId);
                        onClose();
                      }}
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
        <div className="p-4 border-t border-[#ee81ca]/20">
          <div className="text-xs text-[#6F4DA3]/60 text-center">
            {threads.length} chat{threads.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </>
  );
}
