import React from "react";
import { modelGroups } from "../../constants/prompts";
import { IconChevronDown } from "../ui/icons";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Build a quick lookup from model -> provider
  const modelToProvider = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const group of modelGroups) {
      for (const m of group.models) map.set(m, group.provider);
    }
    return map;
  }, []);

  // Filter groups by query while preserving provider sections
  const filteredGroups = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modelGroups;
    return modelGroups
      .map((g) => ({
        provider: g.provider,
        models: g.models.filter((m) => m.toLowerCase().includes(q)),
      }))
      .filter((g) => g.models.length > 0);
  }, [query]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-white/70 px-2.5 py-1 font-medium hover:bg-[#93c5fd]/20"
      >
        <span>{selectedModel}</span>
        {selectedModel && (
          <span className="ml-1 rounded-full border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
            {modelToProvider.get(selectedModel) ?? ""}
          </span>
        )}
        <IconChevronDown />
      </button>
      {isOpen && (
        <div className="absolute left-0 bottom-full z-50 mb-2 w-72 rounded-xl border border-blue-200/60 bg-white p-2 text-blue-900 shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models..."
            className="mb-2 w-full rounded-lg border border-blue-200/60 bg-white px-2.5 py-1 text-xs outline-none"
          />
          <ul role="listbox" className="max-h-56 overflow-auto">
            {filteredGroups.length === 0 && (
              <li className="px-2 py-1 text-xs text-blue-500">No models found</li>
            )}
            {filteredGroups.map((group) => (
              <li key={group.provider} className="mb-1">
                <div
                  role="separator"
                  className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500"
                >
                  {group.provider}
                </div>
                <ul>
                  {group.models.map((model) => (
                    <li key={`${group.provider}-${model}`}>
                      <button
                        role="option"
                        onClick={() => {
                          onModelChange(model);
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-[#93c5fd]/20 ${
                          selectedModel === model ? "bg-[#93c5fd]/20" : ""
                        }`}
                      >
                        <span className="truncate">{model}</span>
                        <span className="shrink-0 rounded-full border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          {group.provider}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

