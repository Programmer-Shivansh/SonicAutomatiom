"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { TaskType } from "@/types/task";
import { PlusIcon, PuzzleIcon } from "lucide-react";
import PluginStoreModal from "./PluginStoreModal";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { AppNode } from "@/types/appNode";

function NodePlugin({
  taskType,
  nodeId,
}: {
  taskType: TaskType;
  nodeId: string;
}) {
  const { updateNodeData, getNode } = useReactFlow();
  const node = getNode(nodeId) as AppNode;
  const [isModalOpen, setModalOpen] = useState(false);
  const currentPlugins = node?.data.plugins || [];
  const task = TaskRegistry[taskType];

  const openPluginStore = () => setModalOpen(true);
  const closePluginStore = () => setModalOpen(false);

  const handlePluginUpdate = useCallback((plugins: string[]) => {
    updateNodeData(nodeId, {
      plugins: plugins,
    });
  }, [nodeId, updateNodeData, node?.data.plugins]);

  if (!task.isAgent) {
    return null;
  }

  const displayPlugins = currentPlugins.length > 0 ? currentPlugins : task.plugins || [];

  return (
    <>
      <div className={cn("flex flex-col gap-2 relative p-3 bg-secondary w-full")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PuzzleIcon size={16} />
            <p className="text-xs font-bold text-muted-foreground">Plugins</p>
          </div>
          <Button variant="ghost" size="icon" onClick={openPluginStore}>
            <PlusIcon size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pl-6">
          {displayPlugins.map((plugin: string) => (
            <Badge key={plugin}>{plugin}</Badge>
          ))}
        </div>
      </div>
      <PluginStoreModal
        isOpen={isModalOpen}
        onClose={closePluginStore}
        plugins={displayPlugins}
        onPluginUpdate={handlePluginUpdate}
      />
    </>
  );
}

export default NodePlugin;
