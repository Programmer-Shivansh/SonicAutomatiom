import { cn } from "@/lib/utils";
import { WorkflowExecutionStatus } from "@/types/workflow";
import React from "react";

const indicatorColors: Record<WorkflowExecutionStatus, string> = {
  PENDING: "bg-blue-400",
  RUNNING: "bg-amber-400",
  FAILED: "bg-rose-500",
  COMPLETED: "bg-emerald-500",
};

export default function ExecutionStatusIndicator({
  status,
}: {
  status: WorkflowExecutionStatus;
}) {
  return (
    <div className={cn("w-3 h-3 rounded-full", indicatorColors[status])} />
  );
}

const labelColors: Record<WorkflowExecutionStatus, string> = {
  PENDING: "text-blue-400",
  RUNNING: "text-amber-400",
  FAILED: "text-rose-500",
  COMPLETED: "text-emerald-500",
};

export function ExecutionStatusLabel({
  status,
}: {
  status: WorkflowExecutionStatus;
}) {
  return <span className={cn("lowercase font-medium", labelColors[status])}>{status}</span>;
}
