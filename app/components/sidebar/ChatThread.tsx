"use client";

import React, { useState } from "react";
import {
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconMessageSquare,
  IconBranch,
} from "../ui/icons";

export interface Thread {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: number;
  }>;
  isBranched?: boolean;
  parentId?: string;
}

interface ChatThreadProps {
  thread: Thread;
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onDelete: (threadId: string) => void;
  onRename: (threadId: string, newTitle: string) => void;
}

export function ChatThread({
  thread,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ChatThreadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Treat older branched threads (created before isBranched existed) as branched too
  const isBranched = Boolean(
    thread.isBranched || thread.parentId || thread.title.startsWith("Branch:"),
  );

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== thread.title) {
      onRename(thread.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(thread.title);
    setIsEditing(false);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getLastMessage = () => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    if (!lastMessage) return "No messages";

    const content =
      lastMessage.content.length > 60
        ? lastMessage.content.substring(0, 60) + "..."
        : lastMessage.content;

    return content;
  };

  const lastMessageTime =
    thread.messages[thread.messages.length - 1]?.timestamp;

  return (
    <div
      className={`group relative rounded-xl p-3 transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-[#eff6ff] border border-[#93c5fd]/30 shadow-sm"
          : "hover:bg-[#eff6ff]/50 border border-transparent"
      }`}
      onClick={() => !isEditing && !confirmDelete && onSelect(thread.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 mt-0.5 ${isActive ? "text-[#2563eb]" : "text-[#1d4ed8]"}`}
        >
          {isBranched ? <IconBranch /> : <IconMessageSquare />}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="w-full px-2 py-1 text-sm font-medium bg-white border border-[#93c5fd]/30 rounded-md text-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                autoFocus
                onBlur={handleRename}
              />
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="p-1 text-[#2563eb] hover:bg-[#2563eb]/10 rounded transition-colors"
                >
                  <IconCheck />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="p-1 text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded transition-colors"
                >
                  <IconX />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3
                  className={`font-medium text-sm truncate flex items-center gap-1 ${
                    isActive ? "text-[#1e3a8a]" : "text-[#1e3a8a]/90"
                  }`}
                >
                  {thread.title}
                  {isBranched && (
                    <span className="ml-1 text-[#1d4ed8]" title="Branched chat">
                      <IconBranch />
                    </span>
                  )}
                </h3>

                {(showActions || confirmDelete) && !isEditing && (
                  <div
                    className={`flex gap-1 ${confirmDelete ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                  >
                    {confirmDelete ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(thread.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Confirm delete"
                        >
                          <IconCheck />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(false);
                          }}
                          className="p-1 text-[#1d4ed8] hover:bg-[#1d4ed8]/10 rounded transition-colors"
                          title="Cancel"
                        >
                          <IconX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          className="p-1 text-[#1d4ed8] hover:text-[#2563eb] hover:bg-[#2563eb]/10 rounded transition-colors"
                          title="Rename chat"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(true);
                          }}
                          className="p-1 text-[#1d4ed8] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete chat"
                        >
                          <IconTrash />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-[#1d4ed8]/80 mt-1 line-clamp-2">
                {getLastMessage()}
              </p>

              {lastMessageTime && (
                <p className="text-xs text-[#1d4ed8]/60 mt-2">
                  {formatDate(lastMessageTime)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
