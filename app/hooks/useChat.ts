import React from "react";
import { ChatMessage, Thread, FrameworkContextKey } from "../types/chat";
import { useLocalStorage } from "./useLocalStorage";

export function useChat() {
  const STORAGE_THREADS = "testscribe:threads";
  const STORAGE_ACTIVE = "testscribe:activeThreadId";
  const STORAGE_MODEL = "testscribe:selectedModel";
  const STORAGE_SIDEBAR = "testscribe:sidebarCollapsed";

  // Initialize with empty array to avoid SSR/CSR mismatches
  const [threads, setThreads, threadsHydrated] = useLocalStorage<Thread[]>(
    STORAGE_THREADS,
    [],
  );
  const [activeThreadId, setActiveThreadId, activeIdHydrated] =
    useLocalStorage<string>(STORAGE_ACTIVE, "");
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    STORAGE_MODEL,
    "gemini-2.5-flash",
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>(
    STORAGE_SIDEBAR,
    false,
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [messageStartTime, setMessageStartTime] = React.useState<number | null>(
    null,
  );
  const [firstTokenTime, setFirstTokenTime] = React.useState<number | null>(
    null,
  );

  // Create default thread after hydration if none exists
  React.useEffect(() => {
    if (threadsHydrated && threads.length === 0) {
      const defaultThread: Thread = {
        id: crypto.randomUUID(),
        title: "New Chat",
        messages: [],
        attachedContexts: [],
      };
      // editUserMessage moved out of useEffect and defined at hook scope
      setThreads([defaultThread]);
      setActiveThreadId(defaultThread.id);
    }
  }, [threadsHydrated, threads.length, setThreads, setActiveThreadId]);

  // Set active thread after hydration if none is set
  React.useEffect(() => {
    if (
      threadsHydrated &&
      activeIdHydrated &&
      threads.length > 0 &&
      !activeThreadId
    ) {
      setActiveThreadId(threads[0].id);
    }
  }, [
    threadsHydrated,
    activeIdHydrated,
    threads.length,
    activeThreadId,
    setActiveThreadId,
  ]);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0];

  // Estimated total tokens across the entire active thread
  const totalThreadTokens = React.useMemo(() => {
    const thread = activeThread;
    if (!thread) return 0;
    let total = 0;
    for (const m of thread.messages) {
      const contentLen = m.content ? m.content.length : 0;
      total += Math.ceil(contentLen / 3.5);
      if (m.attachments && m.attachments.length) {
        for (const att of m.attachments) {
          const attLen = att.content ? att.content.length : 0;
          total += Math.ceil(attLen / 3.5);
        }
      }
    }
    return total;
  }, [activeThread]);

  const sendMessage = async (
    text: string,
    selectedTools: string[],
    attachmentsPayload: any[],
    retryFromMessage?: ChatMessage,
  ) => {
    if (!text.trim()) return;

    let targetMessages: ChatMessage[];
    if (retryFromMessage) {
      const msgIndex = activeThread.messages.findIndex(
        (m) => m.id === retryFromMessage.id,
      );
      targetMessages = activeThread.messages.slice(0, msgIndex);
    } else {
      targetMessages = activeThread.messages;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
      attachments: (attachmentsPayload || []).map((a: any) => ({
        name: a.name,
        size: a.size,
        type: a.type,
        domInspExtractData: a.domInspExtractData,
        content: a.content,
      })),
    };

    const optimistic = threads.map((t) => {
      if (t.id !== activeThread.id) return t;
      const isFirst = targetMessages.length === 0;
      const maybeTitle = isFirst
        ? text.trim().slice(0, 40) || t.title
        : t.title;
      return {
        ...t,
        title: maybeTitle,
        messages: [...targetMessages, userMsg],
      };
    });
    setThreads(optimistic);
    setIsLoading(true);
    setMessageStartTime(Date.now());
    setFirstTokenTime(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          attachments: attachmentsPayload,
          messages: [...targetMessages, userMsg],
          tools: selectedTools,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const streamMsgId = "stream-" + userMsg.id;

        const initialMsg: ChatMessage = {
          id: streamMsgId,
          role: "assistant",
          content: "",
          model: selectedModel,
          timestamp: Date.now(),
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: [...t.messages, initialMsg] }
              : t,
          ),
        );

        if (reader) {
          try {
            let toolCalls: any[] = [];
            let toolResults: any[] = [];
            let totalChars = 0;
            let streamStartTime = Date.now();
            let firstChunkTime: number | null = null;

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              acc += chunk;

              if (!firstChunkTime && chunk.trim().length > 0) {
                firstChunkTime = Date.now();
              }

              totalChars += chunk.length;

              const parseToolData = (content: string) => {
                let cleanContent = content;
                const newToolCalls: any[] = [...toolCalls];
                const newToolResults: any[] = [...toolResults];

                const toolCallMatches = cleanContent.matchAll(
                  /__TOOL_CALL__(.*?)__TOOL_CALL__/g,
                );
                for (const match of toolCallMatches) {
                  try {
                    const toolCall = JSON.parse(match[1]);
                    if (
                      !newToolCalls.find(
                        (tc) => tc.toolCallId === toolCall.toolCallId,
                      )
                    ) {
                      newToolCalls.push(toolCall);
                    }
                    cleanContent = cleanContent.replace(match[0], "");
                  } catch (e) {}
                }

                const toolResultMatches = cleanContent.matchAll(
                  /__TOOL_RESULT__(.*?)__TOOL_RESULT__/g,
                );
                for (const match of toolResultMatches) {
                  try {
                    const toolResult = JSON.parse(match[1]);
                    if (
                      !newToolResults.find(
                        (tr) => tr.toolCallId === toolResult.toolCallId,
                      )
                    ) {
                      newToolResults.push(toolResult);
                    }
                    cleanContent = cleanContent.replace(match[0], "");
                  } catch (e) {}
                }

                toolCalls = newToolCalls;
                toolResults = newToolResults;
                return cleanContent.trim();
              };

              const cleanContent = parseToolData(acc);
              const currentTime = Date.now();
              const elapsedTime = (currentTime - streamStartTime) / 1000;
              const estimatedTokens = Math.ceil(cleanContent.length / 3.5);
              const tokensPerSecond =
                estimatedTokens > 0 && elapsedTime > 0.1
                  ? estimatedTokens / elapsedTime
                  : 0;
              const ttft =
                firstChunkTime && messageStartTime
                  ? firstChunkTime - messageStartTime
                  : undefined;

              setThreads((prev) =>
                prev.map((t) => {
                  if (t.id !== activeThread.id) return t;
                  return {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === streamMsgId
                        ? {
                            ...m,
                            content: cleanContent,
                            toolCalls,
                            toolResults,
                            timeToFirstToken: ttft,
                            tokensPerSecond:
                              tokensPerSecond > 0 ? tokensPerSecond : undefined,
                            totalTokens:
                              estimatedTokens > 0 ? estimatedTokens : undefined,
                          }
                        : m,
                    ),
                  };
                }),
              );
            }
          } catch (error) {
            const errorMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Sorry, streaming failed.",
            };
            setThreads((prev) =>
              prev.map((t) => {
                if (t.id !== activeThread.id) return t;
                return {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === streamMsgId ? errorMsg : m,
                  ),
                };
              }),
            );
          }
        } else {
          const fullText = await res.text();
          const botMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullText,
            model: selectedModel,
            timestamp: Date.now(),
            timeToFirstToken: firstTokenTime || undefined,
          };
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeThread.id
                ? { ...t, messages: [...t.messages, botMsg] }
                : t,
            ),
          );
        }
      } else {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: String(data.content ?? ""),
          model: selectedModel,
          timestamp: Date.now(),
          timeToFirstToken: firstTokenTime || undefined,
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: [...t.messages, botMsg] }
              : t,
          ),
        );
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong.",
        model: selectedModel,
        timestamp: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, errorMsg] }
            : t,
        ),
      );
    } finally {
      setIsLoading(false);
      setMessageStartTime(null);
      setFirstTokenTime(null);
    }
  };

  const editUserMessage = async (
    userMessage: ChatMessage,
    newText: string,
    selectedTools: string[],
  ) => {
    if (!newText.trim()) return;
    const idx = activeThread.messages.findIndex((m) => m.id === userMessage.id);
    if (idx < 0) return;

    // Use original attachments of the user message (includes external contexts if any)
    const attachmentsPayload = (userMessage.attachments || []).map((a) => ({
      name: a.name,
      size: a.size,
      type: a.type,
      domInspExtractData: a.domInspExtractData,
      content: a.content,
    }));

    // Truncate history BEFORE the original user message, then append the edited user message
    const targetMessages = activeThread.messages.slice(0, idx);

    const editedUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: newText.trim(),
      timestamp: Date.now(),
      attachments: attachmentsPayload,
    };

    const optimistic = threads.map((t) => {
      if (t.id !== activeThread.id) return t;
      const isFirst = targetMessages.length === 0;
      const maybeTitle = isFirst
        ? newText.trim().slice(0, 40) || t.title
        : t.title;
      return {
        ...t,
        title: maybeTitle,
        messages: [...targetMessages, editedUserMsg],
      };
    });
    setThreads(optimistic);
    setIsLoading(true);
    setMessageStartTime(Date.now());
    setFirstTokenTime(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          attachments: attachmentsPayload,
          messages: [...targetMessages, editedUserMsg],
          tools: selectedTools,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const streamMsgId = "stream-" + editedUserMsg.id;

        const initialMsg: ChatMessage = {
          id: streamMsgId,
          role: "assistant",
          content: "",
          model: selectedModel,
          timestamp: Date.now(),
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: [...t.messages, initialMsg] }
              : t,
          ),
        );

        if (reader) {
          try {
            let toolCalls: any[] = [];
            let toolResults: any[] = [];
            let streamStartTime = Date.now();
            let firstChunkTime: number | null = null;

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              acc += chunk;

              if (!firstChunkTime && chunk.trim().length > 0) {
                firstChunkTime = Date.now();
              }

              const parseToolData = (content: string) => {
                let cleanContent = content;
                const newToolCalls: any[] = [...toolCalls];
                const newToolResults: any[] = [...toolResults];

                const toolCallMatches = cleanContent.matchAll(
                  /__TOOL_CALL__(.*?)__TOOL_CALL__/g,
                );
                for (const match of toolCallMatches) {
                  try {
                    const toolCall = JSON.parse(match[1]);
                    if (
                      !newToolCalls.find((tc) => tc.toolCallId === toolCall.toolCallId)
                    ) {
                      newToolCalls.push(toolCall);
                    }
                    cleanContent = cleanContent.replace(match[0], "");
                  } catch (e) {}
                }

                const toolResultMatches = cleanContent.matchAll(
                  /__TOOL_RESULT__(.*?)__TOOL_RESULT__/g,
                );
                for (const match of toolResultMatches) {
                  try {
                    const toolResult = JSON.parse(match[1]);
                    if (
                      !newToolResults.find(
                        (tr) => tr.toolCallId === toolResult.toolCallId,
                      )
                    ) {
                      newToolResults.push(toolResult);
                    }
                    cleanContent = cleanContent.replace(match[0], "");
                  } catch (e) {}
                }

                toolCalls = newToolCalls;
                toolResults = newToolResults;
                return cleanContent.trim();
              };

              const cleanContent = parseToolData(acc);
              const ttft =
                firstChunkTime && messageStartTime
                  ? firstChunkTime - messageStartTime
                  : undefined;

              setThreads((prev) =>
                prev.map((t) => {
                  if (t.id !== activeThread.id) return t;
                  return {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === streamMsgId
                        ? {
                            ...m,
                            content: cleanContent,
                            toolCalls,
                            toolResults,
                            timeToFirstToken: ttft,
                          }
                        : m,
                    ),
                  };
                }),
              );
            }
          } catch (error) {
            const errorMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Sorry, streaming failed.",
            };
            setThreads((prev) =>
              prev.map((t) => {
                if (t.id !== activeThread.id) return t;
                return {
                  ...t,
                  messages: t.messages.map((m) => (m.id === streamMsgId ? errorMsg : m)),
                };
              }),
            );
          }
        } else {
          const fullText = await res.text();
          const botMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullText,
            model: selectedModel,
            timestamp: Date.now(),
            timeToFirstToken: firstTokenTime || undefined,
          };
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeThread.id
                ? { ...t, messages: [...t.messages, botMsg] }
                : t,
            ),
          );
        }
      } else {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: String(data.content ?? ""),
          model: selectedModel,
          timestamp: Date.now(),
          timeToFirstToken: firstTokenTime || undefined,
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: [...t.messages, botMsg] }
              : t,
          ),
        );
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong.",
        model: selectedModel,
        timestamp: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, messages: [...t.messages, errorMsg] }
            : t,
        ),
      );
    } finally {
      setIsLoading(false);
      setMessageStartTime(null);
      setFirstTokenTime(null);
    }
  };

  const startNewChat = () => {
    const id = crypto.randomUUID();
    const newThread: Thread = { id, title: "New Chat", messages: [], attachedContexts: [] };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
  };

  const deleteThread = (threadId: string) => {
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== threadId);
      if (threadId === activeThreadId && filtered.length > 0) {
        setActiveThreadId(filtered[0].id);
      } else if (filtered.length === 0) {
        const newId = crypto.randomUUID();
        const newThread: Thread = {
          id: newId,
          title: "New Chat",
          messages: [],
          attachedContexts: [],
        };
        setActiveThreadId(newId);
        return [newThread];
      }
      return filtered;
    });
  };

  const renameThread = (threadId: string, newTitle: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: newTitle } : t)),
    );
  };

  const branchOff = (message: ChatMessage) => {
    const messageIndex = activeThread.messages.findIndex(
      (m) => m.id === message.id,
    );
    // If message not found, fall back to full history
    const messagesUpToHere =
      messageIndex >= 0
        ? activeThread.messages.slice(0, messageIndex + 1) // include the selected message
        : activeThread.messages;

    const newThreadId = crypto.randomUUID();
    const newThread: Thread = {
      id: newThreadId,
      title: `Branch: ${message.content.slice(0, 30)}...`,
      messages: messagesUpToHere,
      isBranched: true,
      parentId: activeThread.id,
      attachedContexts: activeThread.attachedContexts ? [...activeThread.attachedContexts] : [],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
  };

  // Mark provided framework contexts as attached to the active thread
  const markContextsAttached = (keys: FrameworkContextKey[]) => {
    if (!keys || keys.length === 0) return;
    if (!activeThread) return;
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThread.id) return t;
        const existing = new Set(t.attachedContexts || []);
        for (const k of keys) existing.add(k);
        return { ...t, attachedContexts: Array.from(existing) as FrameworkContextKey[] };
      }),
    );
  };

  const isContextAttached = (key: FrameworkContextKey) => {
    if (!activeThread) return false;
    return (activeThread.attachedContexts || []).includes(key);
  };

  const retryMessage = (
    message: ChatMessage,
    selectedTools: string[],
    attachmentsPayload: any[],
  ) => {
    const messageIndex = activeThread.messages.findIndex(
      (m) => m.id === message.id,
    );
    if (messageIndex > 0) {
      const userMessage = activeThread.messages[messageIndex - 1];
      if (userMessage.role === "user") {
        sendMessage(
          userMessage.content,
          selectedTools,
          attachmentsPayload,
          message,
        );
      }
    }
  };

  return {
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
  };
}
