import { GeckoTerminalTask } from "@/lib/workflow/task/GeckoTerminalTask";
import { ExecutionEnvironment } from "@/types/executor";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { sonicBlazeTestnet } from "@/lib/chains";
import { GeckoTerminalPlugin } from "@/lib/goat-plugins/gecko-terminal-plugin";

// Define parameter types based on action
type TokenPriceParams = { tokenAddress: string };
type PoolInfoParams = { poolAddress: string };
type TopListParams = { limit: number };

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
    
    // Execute the tool with the properly typed parameters for each action
    let result;
    
    switch(action) {
      case "getTokenPrice": {
        // Cast the tool to accept TokenPriceParams
        const tokenPriceTool = tool as { execute: (params: TokenPriceParams) => Promise<any> };
        result = await tokenPriceTool.execute({ tokenAddress });
        break;
      }
      case "getPoolInfo": {
        // Cast the tool to accept PoolInfoParams
        const poolInfoTool = tool as { execute: (params: PoolInfoParams) => Promise<any> };
        result = await poolInfoTool.execute({ poolAddress: tokenAddress });
        break;
      }
      case "getTopTokens":
      case "getTopPools": {
        // Cast the tool to accept TopListParams
        const topListTool = tool as { execute: (params: TopListParams) => Promise<any> };
        result = await topListTool.execute({ limit: 10 });
        break;
      }
      default: {
        // For unknown actions, fall back to tokenAddress
        const defaultTool = tool as { execute: (params: TokenPriceParams) => Promise<any> };
        result = await defaultTool.execute({ tokenAddress });
      }
    }
    
    environment.setOutput("Response", result);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}