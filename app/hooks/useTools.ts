import React from "react";

export function useTools() {
  const [selectedTools, setSelectedTools] = React.useState<string[]>([]);
  const [isToolsModalOpen, setIsToolsModalOpen] = React.useState(false);

  const toggleTool = (toolSlug: string) => {
    setSelectedTools(prev => 
      prev.includes(toolSlug) 
        ? prev.filter(t => t !== toolSlug)
        : [...prev, toolSlug]
    );
  };

  const openToolsModal = () => {
    setIsToolsModalOpen(true);
  };

  const closeToolsModal = () => {
    setIsToolsModalOpen(false);
  };

  const clearSelectedTools = () => {
    setSelectedTools([]);
  };

  return {
    selectedTools,
    setSelectedTools,
    toggleTool,
    isToolsModalOpen,
    openToolsModal,
    closeToolsModal,
    clearSelectedTools
  };
}
