import { PluginBase } from "@goat-sdk/core";
import { Chain } from "@goat-sdk/core";
import { NEARService } from "./near.service";

export type NEARPluginParams = {
  networkId?: string;
  nodeUrl?: string;
  defuseContractId?: string;
};

const supportedChains = [
    "1",
    "42161", 
    "43114", 
    "8453", 
    "56", 
    "10", 
    "137",
];

export class NEARPlugin extends PluginBase {
  constructor(params: NEARPluginParams = {}) {
    super("near", [
      new NEARService({
        networkId: params.networkId || "testnet",
        nodeUrl: params.nodeUrl || "https://rpc.testnet.near.org",
        defuseContractId: params.defuseContractId || "intents.near"
      })
    ]);
  }

  supportsChain = (chain: Chain) => chain.type === "evm" && supportedChains.includes(chain.id.toString());
}

export function near(params: NEARPluginParams = {}) {
  return new NEARPlugin(params);
}