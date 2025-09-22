"use client";

import React from "react";
import { Modal } from "./Modal";
import { useApiKeys, ApiKeys } from "@/app/hooks/useApiKeys";

type Field = keyof ApiKeys;

const PROVIDERS: { key: Field; label: string; placeholder: string }[] = [
  { key: "openai", label: "OpenAI", placeholder: "sk-..." },
  { key: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { key: "google", label: "Google Gemini", placeholder: "AIza..." },
  { key: "groq", label: "Groq", placeholder: "gsk_..." },
  { key: "composio", label: "Composio (Tools)", placeholder: "ak_..." },
];

function mask(val?: string) {
  if (!val) return "";
  const visible = Math.min(4, val.length);
  const last = val.slice(-visible);
  return `${"•".repeat(Math.max(0, val.length - visible))}${last}`;
}

export function ApiKeysModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { apiKeys, setKey, clearAll, hasAnyKey } = useApiKeys();
  const [local, setLocal] = React.useState<ApiKeys>({});
  const [show, setShow] = React.useState<Record<Field, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
    groq: false,
    composio: false,
  });

  React.useEffect(() => {
    setLocal(apiKeys || {});
  }, [apiKeys, isOpen]);

  const handleSave = () => {
    (Object.keys(local) as Field[]).forEach((k) => setKey(k, local[k]));
    onClose();
  };

  const handleClear = (k: Field) => {
    setLocal((prev) => ({ ...prev, [k]: "" }));
    setKey(k, undefined);
  };

  const footer = (
    <>
      <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
        Cancel
      </button>
      {hasAnyKey && (
        <button
          onClick={() => {
            clearAll();
            onClose();
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
        >
          Clear All
        </button>
      )}
      <button
        onClick={handleSave}
        className="inline-flex items-center justify-center px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#2563eb]/90 transition leading-none"
      >
        Save
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bring Your Own Keys (BYOK)" footer={footer}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Enter provider API keys to use your own billing. Keys are stored only in your browser's
          localStorage and sent to the server with each request to call the selected provider. Remove a value to
          fall back to the server-configured key.
        </div>
        <div className="grid grid-cols-1 gap-4">
          {PROVIDERS.map((p) => {
            const value = local[p.key] || "";
            const isSet = !!apiKeys[p.key];
            return (
              <div key={p.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.label}</div>
                    <div className="text-xs text-gray-500">
                      {isSet ? `Saved: ${mask(apiKeys[p.key])}` : "Not set"}
                    </div>
                  </div>
                  <button
                    onClick={() => setShow((s) => ({ ...s, [p.key]: !s[p.key] }))}
                    className="text-xs text-[#2563eb] hover:underline"
                  >
                    {show[p.key] ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type={show[p.key] ? "text" : "password"}
                    value={value}
                    onChange={(e) => setLocal((prev) => ({ ...prev, [p.key]: e.target.value }))}
                    placeholder={p.placeholder}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleClear(p.key)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    title="Clear key"
                  >
                    Clear
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500">
          Security note: Keys are visible to anyone with access to your browser profile. For shared
          deployments, prefer server-managed keys when possible.
        </div>
      </div>
    </Modal>
  );
}
