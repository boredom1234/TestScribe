import React from "react";
import { Toolkit, Tool } from "../../types/chat";
import { Modal } from "./Modal";

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

  React.useEffect(() => {
    async function fetchToolkits() {
      try {
        const response = await fetch("/api/toolkits");
        const data = await response.json();
        setToolkits(data.items || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchToolkits();
  }, []);

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
        const response = await fetch(`/api/toolkits/${toolkit.slug}/tools`);
        const data = await response.json();
        toolkit.tools = data.items || [];
        setToolkits([...toolkits]); // Trigger re-render
      } catch (error) {}
    }

    setExpandedToolkit(toolkit.slug);
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
