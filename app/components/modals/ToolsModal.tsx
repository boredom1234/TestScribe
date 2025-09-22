import React from "react";
import { Toolkit, Tool } from "../../types/chat";
import { Modal } from "./Modal";
import { useApiKeys } from "@/app/hooks/useApiKeys";

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

function ToolsModalContent({
  selectedTools,
  setSelectedTools,
}: {
  selectedTools: string[];
  setSelectedTools: (tools: string[]) => void;
}) {
  const [toolkits, setToolkits] = React.useState<Toolkit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedToolkit, setExpandedToolkit] = React.useState<string | null>(
    null,
  );
  const { apiKeys, hydrated } = useApiKeys();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Tool[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchCursor, setSearchCursor] = React.useState<string | null>(null);
  const [toolkitCursors, setToolkitCursors] = React.useState<Record<string, string | null>>({});

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  React.useEffect(() => {
    if (!hydrated) return; // wait for localStorage to hydrate so BYOK keys are available
    let cancelled = false;
    async function fetchToolkits() {
      try {
        setLoading(true);
        const response = await fetch("/api/toolkits", {
          headers: apiKeys.composio
            ? { "x-client-composio-key": apiKeys.composio }
            : {},
        });
        const data = await response.json();
        if (!cancelled) setToolkits(data.items || []);
      } catch (error) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchToolkits();
    return () => {
      cancelled = true;
    };
  }, [hydrated, apiKeys.composio]);

  const extractCursor = (data: any): string | null => {
    return (
      data?.pagination?.cursor ||
      data?.pagination?.next_cursor ||
      data?.next_cursor ||
      data?.cursor ||
      null
    );
  };

  React.useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    async function searchTools() {
      if (!debouncedSearch) {
        setSearchResults([]);
        setSearchCursor(null);
        return;
      }
      try {
        setSearchLoading(true);
        const params = new URLSearchParams({ search: debouncedSearch, limit: "50" });
        const response = await fetch(`/api/tools?${params.toString()}`, {
          headers: apiKeys.composio
            ? { "x-client-composio-key": apiKeys.composio }
            : {},
        });
        const data = await response.json();
        if (cancelled) return;
        setSearchResults((data.items as Tool[]) || []);
        setSearchCursor(extractCursor(data));
      } catch (error) {
        if (!cancelled) {
          setSearchResults([]);
          setSearchCursor(null);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    searchTools();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, hydrated, apiKeys.composio]);

  const toggleTool = (toolSlug: string) => {
    if (selectedTools.includes(toolSlug)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolSlug));
    } else {
      setSelectedTools([...selectedTools, toolSlug]);
    }
  };

  const expandToolkit = async (toolkit: Toolkit) => {
    if (expandedToolkit === toolkit.slug) {
      setExpandedToolkit(null);
      return;
    }

    if (!toolkit.tools) {
      // Fetch tools for this toolkit
      try {
        const response = await fetch(`/api/toolkits/${toolkit.slug}/tools`, {
          headers: apiKeys.composio
            ? { "x-client-composio-key": apiKeys.composio }
            : {},
        });
        const data = await response.json();
        toolkit.tools = data.items || [];
        setToolkits([...toolkits]); // Trigger re-render
        setToolkitCursors((prev) => ({ ...prev, [toolkit.slug]: extractCursor(data) }));
      } catch (error) {}
    }

    setExpandedToolkit(toolkit.slug);
  };

  const loadMoreSearch = async () => {
    if (!searchCursor) return;
    try {
      setSearchLoading(true);
      const params = new URLSearchParams({
        search: debouncedSearch,
        limit: "50",
        cursor: searchCursor,
      });
      const response = await fetch(`/api/tools?${params.toString()}`, {
        headers: apiKeys.composio
          ? { "x-client-composio-key": apiKeys.composio }
          : {},
      });
      const data = await response.json();
      const items = (data.items as Tool[]) || [];
      setSearchResults((prev) => [...prev, ...items]);
      setSearchCursor(extractCursor(data));
    } catch (error) {
    } finally {
      setSearchLoading(false);
    }
  };

  const loadMoreToolkit = async (toolkit: Toolkit) => {
    const next = toolkitCursors[toolkit.slug];
    if (!next) return;
    try {
      const params = new URLSearchParams({ limit: "1000", cursor: next });
      const response = await fetch(
        `/api/toolkits/${toolkit.slug}/tools?${params.toString()}`,
        {
          headers: apiKeys.composio
            ? { "x-client-composio-key": apiKeys.composio }
            : {},
        },
      );
      const data = await response.json();
      const items = (data.items as Tool[]) || [];
      toolkit.tools = [...(toolkit.tools || []), ...items];
      setToolkits([...toolkits]);
      setToolkitCursors((prev) => ({ ...prev, [toolkit.slug]: extractCursor(data) }));
    } catch (error) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tools (e.g. hubspot deals, github issues)"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
        />
      </div>

      {debouncedSearch && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div className="font-medium text-gray-900">Search results</div>
            {searchLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2563eb]"></div>
            )}
          </div>
          <div className="p-4 space-y-2">
            {!searchLoading && searchResults.length === 0 && (
              <div className="text-sm text-gray-500">No results</div>
            )}
            {searchResults.map((tool) => (
              <label
                key={tool.slug || tool.name}
                className="flex items-start space-x-3 p-2 hover:bg-white rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool.slug || tool.name)}
                  onChange={() => toggleTool(tool.slug || tool.name)}
                  className="mt-1 text-[#2563eb] focus:ring-[#2563eb]"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {tool.displayName || tool.name}
                  </div>
                  <div className="text-xs text-gray-500">{tool.description}</div>
                  <div className="text-xs text-gray-400 font-mono">
                    {tool.slug || tool.name}
                  </div>
                </div>
              </label>
            ))}
            {searchCursor && (
              <div className="pt-2">
                <button
                  onClick={loadMoreSearch}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {toolkits.map((toolkit) => (
        <div
          key={toolkit.slug}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => expandToolkit(toolkit)}
            className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {toolkit.meta.logo && (
                <img
                  src={toolkit.meta.logo}
                  alt={toolkit.name}
                  className="w-8 h-8"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{toolkit.name}</h3>
                <p className="text-sm text-gray-500">
                  {toolkit.meta.description}
                </p>
                <p className="text-xs text-gray-400">
                  {toolkit.meta.tools_count} tools
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedToolkit === toolkit.slug ? "−" : "+"}
            </div>
          </button>

          {expandedToolkit === toolkit.slug && toolkit.tools && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="p-4 space-y-2">
                {toolkit.tools.map((tool) => (
                  <label
                    key={tool.slug || tool.name}
                    className="flex items-start space-x-3 p-2 hover:bg-white rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.slug || tool.name)}
                      onChange={() => toggleTool(tool.slug || tool.name)}
                      className="mt-1 text-[#2563eb] focus:ring-[#2563eb]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {tool.displayName || tool.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tool.description}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {tool.slug || tool.name}
                      </div>
                    </div>
                  </label>
                ))}
                {toolkitCursors[toolkit.slug] && (
                  <div className="pt-2">
                    <button
                      onClick={() => loadMoreToolkit(toolkit)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ToolsModal({
  isOpen,
  onClose,
  selectedTools,
  onSelectedToolsChange,
}: ToolsModalProps) {
  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
      >
        Cancel
      </button>
      <button
        onClick={onClose}
        className="inline-flex items-center justify-center px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#2563eb]/90 transition leading-none"
      >
        Done ({selectedTools.length} selected)
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Tools"
      footer={footer}
    >
      <ToolsModalContent
        selectedTools={selectedTools}
        setSelectedTools={onSelectedToolsChange}
      />
    </Modal>
  );
}
