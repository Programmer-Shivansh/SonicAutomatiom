"use client";

import { ColorForHandle } from "@/app/workflow/_components/nodes/common";
import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Handle, Position } from "@xyflow/react";
import { ReactNode } from "react";

export function NodeOutputs({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y divide-border/50 gap-1 rounded-b-lg overflow-hidden">{children}</div>;
}

export function NodeOutput({ output }: { output: TaskParam }) {
  return (
    <div className="flex justify-end relative p-3 bg-secondary/70 hover:bg-secondary transition-colors">
      <p className="text-xs text-muted-foreground font-medium">{output.name}</p>
      <Handle
        id={output.name}
        type="source"
        position={Position.Right}
        className={cn(
          "!bg-muted-foreground !border-2 !border-background !-right-2 !w-4 !h-4 transition-colors",
          ColorForHandle[output.type]
        )}
      />
    </div>
  );
}
