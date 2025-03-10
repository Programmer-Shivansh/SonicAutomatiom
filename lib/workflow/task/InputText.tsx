import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { PenLineIcon, LucideProps } from "lucide-react";

export const InputTextTask = {
  type: TaskType.INPUT_TEXT,
  label: "Input text",
  icon: (props: LucideProps) => (
    <PenLineIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
  credits: 5,
  inputs: [
    {
      name: "Input text",
      type: TaskParamType.STRING,
      helperText: "eg: What is the price of BTC?",
      required: true,
      hideHandle: true,
    },
  ] as const,
  outputs: [
    { name: "Text", type: TaskParamType.STRING },
  ] as const,
} satisfies WorkflowTask;
