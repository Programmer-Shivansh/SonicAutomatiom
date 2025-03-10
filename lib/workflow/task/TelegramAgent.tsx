import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { LucideProps, Send } from "lucide-react";

export const TelegramAgentTask = {
    type: TaskType.TELEGRAM_AGENT,
    label: "Telegram Agent",
    icon: (props: LucideProps) => (
        <Send className="stroke-blue-400" {...props} />
    ),
    isEntryPoint: false,
    isAgent: false,
    credits: 2,
    inputs: [
        {
            name: "Bot Token",
            type: TaskParamType.CREDENTIAL,
            required: true,
        },
        {
            name: "Chat ID",
            type: TaskParamType.STRING,
            required: true,
            variant: "text",
        },
        {
            name: "System Prompt",
            type: TaskParamType.STRING,
            required: true,
            variant: "textarea",
        },
        {
            name: "Context",
            type: TaskParamType.STRING,
            required: false,
            variant: "textarea",
        },
        {
            name: "Prompt",
            type: TaskParamType.STRING,
            required: true,
            variant: "textarea",
        },
    ] as const,
    plugins: [],
    outputs: [
        {
            name: "Response",
            type: TaskParamType.STRING,
        },
    ] as const,
} satisfies WorkflowTask;
