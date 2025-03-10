import { Plugin } from "@/types/plugin";

export const pluginStore: Plugin[] = [
  {
    id: "geckoTerminal",
    name: "GeckoTerminal", 
    description: "Get DEX data for Sonic blockchain using GeckoTerminal API",
    icon: "📊",
    category: "Analytics",
  },
  {
    id: "CoinGecko",
    name: "CoinGecko", 
    description: "Get coin information using CoinGecko API",
    icon: "🪙",
    category: "Search",
  },
  {
    id: "sendETH",
    name: "Send Sonic", 
    description: "Send Sonic tokens to a wallet",
    icon: "💰",
    category: "Transaction",
  },
  {
    id: "dexscreener",
    name: "Dexscreener",
    description: "Get information about a token using the Dexscreener API.",
    icon: "🔄",
    category: "Analytics",
  },
  {
    id: "zeroEx",
    name: "ZeroEx",
    description: "Get quotes and swap on 0x",
    icon: "🔄",
    category: "Transaction",
  },
  {
    id: "balancer",
    name: "Balancer",
    description: "Swap tokens and provide liquidity on Balancer",
    icon: "⚖️",
    category: "Transaction",
  },
  {
    id: "uniswap",
    name: "Uniswap",
    description: "Swap tokens on Uniswap",
    icon: "🦄",
    category: "Transaction",
  },
  {
    id: "etherScan",
    name: "SonicScan",
    description: "Get information about a wallet/token using the SonicScan API.",
    icon: "🔍",
    category: "Analytics",
  },
  {
    id: "erc20",
    name: "Sonic Tokens",
    description: "Interact with ERC20 tokens on Sonic blockchain",
    icon: "🪙",
    category: "Transaction",
  }
];