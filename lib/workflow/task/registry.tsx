import { AddPropertyToJsonTask } from "@/lib/workflow/task/AddPropertyToJson";
import { ClickElementTask } from "@/lib/workflow/task/ClickElement";
import { DeliverViaWebhookTask } from "@/lib/workflow/task/DeliverViaWebhook";
import { ExtractDataWithAITask } from "@/lib/workflow/task/ExtractDataWithAI";
import { ExtractTextFromElementTask } from "@/lib/workflow/task/ExtractTextFromElement";
import { FillInputTask } from "@/lib/workflow/task/FillInput";
import { LaunchBrowserTask } from "@/lib/workflow/task/LaunchBrowser";
import { NavigateUrlTask } from "@/lib/workflow/task/NavigateUrlTask";
import { PageToHtmlTask } from "@/lib/workflow/task/PageToHtml";
import { ReadPropertyFromJsonTask } from "@/lib/workflow/task/ReadPropertyFromJson";
import { ScrollToElementTask } from "@/lib/workflow/task/ScrollToElement";
import { WaitForElementTask } from "@/lib/workflow/task/WaitForElement";
import { InputTextTask } from "@/lib/workflow/task/InputText";
import { AgentTask } from "@/lib/workflow/task/AgentTask";
import { TelegramAgentTask } from "@/lib/workflow/task/TelegramAgent";
import { TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { TelegramTask } from "@/lib/workflow/task/TelegramTask";
import { AgentWithSafeWalletTask } from "@/lib/workflow/task/AgentWithSafeWalletTask";
import { GeckoTerminalTask } from "@/lib/workflow/task/GeckoTerminalTask";
type Registry = {
  [K in TaskType]: WorkflowTask & { type: K };
};

export const TaskRegistry: Registry = {
  AGENT_WITH_SAFE_WALLET: AgentWithSafeWalletTask,
  TELEGRAM: TelegramTask,
  TELEGRAM_AGENT: TelegramAgentTask,
  AGENT: AgentTask,
  INPUT_TEXT: InputTextTask,
  LAUNCH_BROWSER: LaunchBrowserTask,
  PAGE_TO_HTML: PageToHtmlTask,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementTask,
  FILL_INPUT: FillInputTask,
  CLICK_ELEMENT: ClickElementTask,
  WAIT_FOR_EMELEMENT: WaitForElementTask,
  DELIVER_VIA_WEBHOOK: DeliverViaWebhookTask,
  EXTRACT_DATA_WITH_AI: ExtractDataWithAITask,
  READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonTask,
  ADD_PROPERTY_TO_JSON: AddPropertyToJsonTask,
  NAVIGATE_URL: NavigateUrlTask,
  SCROLL_TO_ELEMENT: ScrollToElementTask,
  GECKO_TERMINAL: GeckoTerminalTask,
};
