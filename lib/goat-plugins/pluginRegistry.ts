import { coingecko } from '@goat-sdk/plugin-coingecko';
import { sendETH } from '@goat-sdk/wallet-evm';
import { zeroEx } from '@goat-sdk/plugin-0x';
import { GeckoTerminalPlugin } from './gecko-terminal-plugin';

import { pluginStore } from "./pluginStore";

type PluginId = typeof pluginStore[number]["id"];

export const pluginRegistry: Record<PluginId, any> = {
  CoinGecko: coingecko({ apiKey: process.env.COINGECKO_API_KEY as string }),
  sendETH: sendETH(),
  zeroEx: zeroEx({ apiKey: process.env.ZEROEX_API_KEY as string }), 
  geckoTerminal: new GeckoTerminalPlugin(),
  dexscreener: { getTools: () => [] }, // Placeholder
  balancer: { getTools: () => [] },    // Placeholder
  uniswap: { getTools: () => [] },     // Placeholder
  etherScan: { getTools: () => [] },   // Placeholder
  erc20: { getTools: () => [] }        // Placeholder
} as const;