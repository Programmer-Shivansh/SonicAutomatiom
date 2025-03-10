import { InputTextTask } from "@/lib/workflow/task/InputText";
import { ExecutionEnvironment } from "@/types/executor";

export async function InputTextExecutor(
  environment: ExecutionEnvironment<typeof InputTextTask>
): Promise<boolean> {
  try {
    const text = environment.getInput("Input text");
    environment.log.info(`Input text: ${text}`);
    environment.setOutput("Text", text);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
