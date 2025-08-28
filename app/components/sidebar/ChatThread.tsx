"use client";

import React, { useState } from 'react';
import { IconEdit, IconTrash, IconCheck, IconX, IconMessageSquare, IconBranch } from '../ui/icons';

export interface Thread {
  id: string;
  title: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string; timestamp?: number }>;
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

export function ChatThread({ thread, isActive, onSelect, onDelete, onRename }: ChatThreadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const [showActions, setShowActions] = useState(false);

  // Treat older branched threads (created before isBranched existed) as branched too
  const isBranched = Boolean(thread.isBranched || thread.parentId || thread.title.startsWith('Branch:'));

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
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getLastMessage = () => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    if (!lastMessage) return 'No messages';
    
    const content = lastMessage.content.length > 60 
      ? lastMessage.content.substring(0, 60) + '...' 
      : lastMessage.content;
    
    return content;
  };

  const lastMessageTime = thread.messages[thread.messages.length - 1]?.timestamp;

  return (
    <div
      className={`group relative rounded-xl p-3 transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'bg-[#f5dbef] border border-[#ee81ca]/30 shadow-sm' 
          : 'hover:bg-[#f5dbef]/50 border border-transparent'
      }`}
      onClick={() => !isEditing && onSelect(thread.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-[#ca0277]' : 'text-[#6F4DA3]'}`}>
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
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="w-full px-2 py-1 text-sm font-medium bg-white border border-[#ee81ca]/30 rounded-md text-[#432A78] focus:outline-none focus:ring-2 focus:ring-[#ca0277]/20"
                autoFocus
                onBlur={handleRename}
              />
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="p-1 text-[#ca0277] hover:bg-[#ca0277]/10 rounded transition-colors"
                >
                  <IconCheck />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="p-1 text-[#6F4DA3] hover:bg-[#6F4DA3]/10 rounded transition-colors"
                >
                  <IconX />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium text-sm truncate flex items-center gap-1 ${
                  isActive ? 'text-[#432A78]' : 'text-[#432A78]/90'
                }`}>
                  {thread.title}
                  {isBranched && (
                    <span className="ml-1 text-[#6F4DA3]" title="Branched chat">
                      <IconBranch />
                    </span>
                  )}
                </h3>
                
                {showActions && !isEditing && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="p-1 text-[#6F4DA3] hover:text-[#ca0277] hover:bg-[#ca0277]/10 rounded transition-colors"
                      title="Rename chat"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this chat?')) {
                          onDelete(thread.id);
                        }
                      }}
                      className="p-1 text-[#6F4DA3] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete chat"
                    >
                      <IconTrash />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-[#6F4DA3]/80 mt-1 line-clamp-2">
                {getLastMessage()}
              </p>
              
              {lastMessageTime && (
                <p className="text-xs text-[#6F4DA3]/60 mt-2">
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
