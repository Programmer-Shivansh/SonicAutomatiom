import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { LucideProps, LineChart } from "lucide-react";

export const GeckoTerminalTask = {
  type: TaskType.GECKO_TERMINAL,
  label: "Sonic Market Data",
  icon: (props: LucideProps) => (
    <LineChart className="stroke-green-400" {...props} />
  ),
  isEntryPoint: false,
  isAgent: true,
  credits: 1,
  inputs: [
    {
      name: "Wallet",
      type: TaskParamType.CREDENTIAL,
      required: true,
    },
    {
      name: "Token Address",
      type: TaskParamType.STRING,
      required: true,
      helperText: "Enter the token contract address on Sonic"
    },
    {
      name: "Action",
      type: TaskParamType.SELECT,
      required: true,
      variant: "select",
      options: [
        { label: "Get Token Price", value: "getTokenPrice" },
        { label: "Get Top Tokens", value: "getTopTokens" },
        { label: "Get Pool Info", value: "getPoolInfo" },
        { label: "Get Top Pools", value: "getTopPools" }
      ],
    }
  ] as const,
  plugins: ["geckoTerminal"],
  outputs: [
    {
      name: "Response",
      type: TaskParamType.STRING,
    },
  ] as const,
} satisfies WorkflowTask; 