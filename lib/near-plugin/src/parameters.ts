import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class TransferParameters extends createToolParameters(
  z.object({
    recipient: z.string().describe("The NEAR account to receive the tokens"),
    amount: z.string().describe("The amount of NEAR tokens to transfer"),
  }),
) {}

export class SwapParameters extends createToolParameters(
  z.object({
    inputTokenId: z.string().describe("The token contract address to sell"),
    outputTokenId: z.string().describe("The token contract address to buy"),
    amount: z.string().describe("The amount of tokens to sell"),
    slippageTolerance: z
      .number()
      .optional()
      .describe("The maximum acceptable slippage percentage (default: 0.01 or 1%)"),
  }),
) {}

export class CrossChainSwapParameters extends createToolParameters(
  z.object({
    defuse_asset_identifier_in: z.string().describe("The identifier of the asset to swap from"),
    defuse_asset_identifier_out: z.string().describe("The identifier of the asset to swap to"),
    exact_amount_in: z.string().describe("The exact amount to swap"),
    network: z.string().optional().describe("The network to use for the swap"),
    destination_address: z.string().optional().describe("The destination address for the swap"),
  }),
) {}