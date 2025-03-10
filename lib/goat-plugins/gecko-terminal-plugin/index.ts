// Simple GeckoTerminal plugin without extending any base class
export class GeckoTerminalPlugin {
  private baseUrl = "https://api.geckoterminal.com/api/v2";

  getTools() {
    return [
      {
        name: "getTokenPrice",
        description: "Get the current price of a token on Sonic",
        parameters: {
          type: "object",
          properties: {
            tokenAddress: {
              type: "string",
              description: "The contract address of the token"
            }
          },
          required: ["tokenAddress"]
        },
        execute: async (parameters: { tokenAddress: string }) => {
          try {
            const response = await fetch(`${this.baseUrl}/networks/sonic_blaze_testnet/tokens/${parameters.tokenAddress}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch token data: ${response.statusText}`);
            }
            const data = await response.json();
            return JSON.stringify(data);
          } catch (error) {
            return JSON.stringify({ error: (error as Error).message });
          }
        }
      },
      {
        name: "getTopTokens",
        description: "Get the top tokens on Sonic by volume",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of tokens to return (default: 10)"
            }
          }
        },
        execute: async (parameters: { limit?: number }) => {
          const limit = parameters.limit || 10;
          try {
            const response = await fetch(`${this.baseUrl}/networks/sonic_blaze_testnet/tokens?page=1&limit=${limit}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch top tokens: ${response.statusText}`);
            }
            const data = await response.json();
            return JSON.stringify(data);
          } catch (error) {
            return JSON.stringify({ error: (error as Error).message });
          }
        }
      },
      {
        name: "getPoolInfo",
        description: "Get information about a liquidity pool on Sonic",
        parameters: {
          type: "object",
          properties: {
            poolAddress: {
              type: "string",
              description: "The address of the liquidity pool"
            }
          },
          required: ["poolAddress"]
        },
        execute: async (parameters: { poolAddress: string }) => {
          try {
            const response = await fetch(`${this.baseUrl}/networks/sonic_blaze_testnet/pools/${parameters.poolAddress}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch pool data: ${response.statusText}`);
            }
            const data = await response.json();
            return JSON.stringify(data);
          } catch (error) {
            return JSON.stringify({ error: (error as Error).message });
          }
        }
      },
      {
        name: "getTopPools",
        description: "Get the top liquidity pools on Sonic",
        parameters: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of pools to return (default: 10)"
            }
          }
        },
        execute: async (parameters: { limit?: number }) => {
          const limit = parameters.limit || 10;
          try {
            const response = await fetch(`${this.baseUrl}/networks/sonic_blaze_testnet/pools?page=1&limit=${limit}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch top pools: ${response.statusText}`);
            }
            const data = await response.json();
            return JSON.stringify(data);
          } catch (error) {
            return JSON.stringify({ error: (error as Error).message });
          }
        }
      }
    ];
  }
} 