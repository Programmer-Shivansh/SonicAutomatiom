import { GeckoTerminalTask } from "@/lib/workflow/task/GeckoTerminalTask";
import { ExecutionEnvironment } from "@/types/executor";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { sonicBlazeTestnet } from "@/lib/chains";
import { GeckoTerminalPlugin } from "@/lib/goat-plugins/gecko-terminal-plugin";

export async function GeckoTerminalExecutor(
  environment: ExecutionEnvironment<typeof GeckoTerminalTask>
): Promise<boolean> {
  try {
    const wallet = environment.getInput("Wallet");
    if (!wallet) {
      environment.log.error("input->wallet not defined");
      return false;
    }
    
    const tokenAddress = environment.getInput("Token Address");
    if (!tokenAddress) {
      environment.log.error("input->tokenAddress not defined");
      return false;
    }
    
    const action = environment.getInput("Action");
    if (!action) {
      environment.log.error("input->action not defined");
      return false;
    }
    
    // Get credentials from DB
    const credential = await prisma.credential.findUnique({
      where: { id: wallet },
    });

    if (!credential) {
      environment.log.error("credential not found");
      return false;
    }

    // Initialize GeckoTerminal plugin
    const geckoTerminal = new GeckoTerminalPlugin();
    
    // Find the tool for the requested action
    const tools = geckoTerminal.getTools();
    const tool = tools.find(t => t.name === action);
    
    if (!tool) {
      environment.log.error(`Action ${action} not found`);
      return false;
    }
    
    environment.log.info(`Chain: ${JSON.stringify(sonicBlazeTestnet)}`);
    environment.log.info(`Executing ${action} for token ${tokenAddress} on Sonic Blaze Testnet`);
    
    // Execute the tool with the provided parameters
    let parameters = {};
    
    switch(action) {
      case "getTokenPrice":
      case "getPoolInfo":
        parameters = { 
          tokenAddress: action === "getTokenPrice" ? tokenAddress : undefined,
          poolAddress: action === "getPoolInfo" ? tokenAddress : undefined
        };
        break;
      case "getTopTokens":
      case "getTopPools":
        parameters = { limit: 10 };
        break;
    }
    
    const result = await tool.execute(parameters);
    
    environment.setOutput("Response", result);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
} 