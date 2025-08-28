import React from "react";
import { modelOptions } from "../../constants/prompts";
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

  const filteredModels = React.useMemo(
    () =>
      modelOptions.filter((m) => m.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

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
        className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white/70 px-2.5 py-1 font-medium hover:bg-[#ed78c6]/20"
      >
        {selectedModel}
        <IconChevronDown />
      </button>
      {isOpen && (
        <div className="absolute left-0 bottom-full z-50 mb-2 w-72 rounded-xl border border-rose-200/60 bg-white p-2 text-rose-900 shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models..."
            className="mb-2 w-full rounded-lg border border-rose-200/60 bg-white px-2.5 py-1 text-xs outline-none"
          />
          <ul role="listbox" className="max-h-56 overflow-auto">
            {filteredModels.length === 0 && (
              <li className="px-2 py-1 text-xs text-rose-500">
                No models found
              </li>
            )}
            {filteredModels.map((model) => (
              <li key={model}>
                <button
                  role="option"
                  onClick={() => {
                    onModelChange(model);
                    setIsOpen(false);
                  }}
                  className={`block w-full rounded-md px-2 py-1 text-left text-sm hover:bg-[#ed78c6]/20 ${selectedModel === model ? "bg-[#ed78c6]/20" : ""}`}
                >
                  {model}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
