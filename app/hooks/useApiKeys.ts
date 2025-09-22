import React from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ApiKeys = {
  openai?: string;
  anthropic?: string;
  google?: string;
  groq?: string;
  composio?: string;
};

const STORAGE_API_KEYS = "testscribe:apiKeys";

export function useApiKeys() {
  const [apiKeys, setApiKeys, hydrated] = useLocalStorage<ApiKeys>(
    STORAGE_API_KEYS,
    {},
  );

  const setKey = React.useCallback(
    (provider: keyof ApiKeys, value?: string) => {
      setApiKeys((prev) => {
        const next = { ...prev } as ApiKeys;
        if (value && value.trim()) next[provider] = value.trim();
        else delete next[provider];
        return next;
      });
    },
    [setApiKeys],
  );

  const clearAll = React.useCallback(() => {
    setApiKeys({});
  }, [setApiKeys]);

  const hasAnyKey = !!(
    (apiKeys.openai && apiKeys.openai.length) ||
    (apiKeys.anthropic && apiKeys.anthropic.length) ||
    (apiKeys.google && apiKeys.google.length) ||
    (apiKeys.groq && apiKeys.groq.length) ||
    (apiKeys.composio && apiKeys.composio.length)
  );

  return { apiKeys, setApiKeys, setKey, clearAll, hasAnyKey, hydrated } as const;
}
