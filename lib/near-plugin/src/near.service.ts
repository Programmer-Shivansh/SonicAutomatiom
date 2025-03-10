// @ts-nocheck
import { Tool } from "@goat-sdk/core";
import { NEARWalletClient } from "./wallet";
import { TransferParameters, SwapParameters, CrossChainSwapParameters } from "./parameters";
import { utils } from "near-api-js";
import { providers } from "near-api-js";
import * as Borsh from "@dao-xyz/borsh";
import * as js_sha256 from "js-sha256";
import crypto from "crypto";
import {
  init_env,
  ftGetTokenMetadata,
  estimateSwap,
  instantSwap,
  fetchAllPools,
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  ONE_YOCTO_NEAR,
} from "@ref-finance/ref-sdk";

// Constants
const DEFUSE_RPC_URL = "https://solver-relay-v2.chaindefuser.com/rpc";
const POLLING_INTERVAL_MS = 2000; // 2 seconds
const MAX_POLLING_TIME_MS = 300000; // 5 minutes

// Borsh class definition for payload
class Payload {
  tag: number;
  message: string;
  nonce: number[];
  recipient: string;

  constructor(params: { tag: number; message: string; nonce: number[]; recipient: string }) {
    this.tag = params.tag;
    this.message = params.message;
    this.nonce = params.nonce;
    this.recipient = params.recipient;
  }
}

// Intent message type definition
interface IntentMessage {
  signer_id: string;
  deadline: string;
  intents: any[];
}

// Intent status type definition
interface IntentStatus {
  status: string;
  data?: {
    hash: string;
  };
}

export class NEARService {
  private settings: {
    networkId: string;
    nodeUrl: string;
    defuseContractId: string;
  };

  constructor(settings: {
    networkId: string;
    nodeUrl: string;
    defuseContractId: string;
  }) {
    this.settings = settings;
  }

  private async makeRPCRequest<T>(method: string, params: any[]): Promise<T> {
    const requestBody = {
      id: 1,
      jsonrpc: "2.0",
      method,
      params,
    };
    console.log("Making RPC request to:", DEFUSE_RPC_URL, method);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(DEFUSE_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }
    return data.result;
  }

  async checkStorageBalance(account: any, contractId: string): Promise<boolean> {
    try {
      const balance = await account.viewFunction({
        contractId,
        methodName: "storage_balance_of",
        args: { account_id: account.accountId },
      });
      return balance !== null && balance.total !== "0";
    } catch (error) {
      console.error(`Error checking storage balance: ${error}`);
      return false;
    }
  }

  @Tool({
    name: "near_transferNEAR",
    description: "Transfer NEAR tokens to another account",
  })
  async transferNEAR(walletClient: NEARWalletClient, parameters: TransferParameters) {
    const account = await walletClient.getAccount();
    
    // Execute transfer
    const result = await account.sendMoney(
      parameters.recipient,
      BigInt(utils.format.parseNearAmount(parameters.amount)!)
    );

    return { 
      success: true,
      transactionHash: result.transaction.hash,
      amount: parameters.amount,
      recipient: parameters.recipient
    };
  }

  @Tool({
    name: "near_swapTokens",
    description: "Swap tokens using Ref Finance on NEAR",
  })
  async swapTokens(walletClient: NEARWalletClient, parameters: SwapParameters) {
    try {
      const { inputTokenId, outputTokenId, amount, slippageTolerance = 0.01 } = parameters;
      
      // Initialize Ref SDK
      init_env(this.settings.networkId);
      
      // Get token metadata
      const tokenIn = await ftGetTokenMetadata(inputTokenId);
      const tokenOut = await ftGetTokenMetadata(outputTokenId);

      // Get all pools for estimation
      const { simplePools } = await fetchAllPools();
      const swapTodos = await estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: amount,
        simplePools,
        options: {
          enableSmartRouting: true,
        },
      });

      if (!swapTodos || swapTodos.length === 0) {
        throw new Error("No valid swap route found");
      }

      const account = await walletClient.getAccount();

      // Check storage balance for both tokens
      const hasStorageIn = await this.checkStorageBalance(account, inputTokenId);
      const hasStorageOut = await this.checkStorageBalance(account, outputTokenId);

      const transactions = await instantSwap({
        tokenIn,
        tokenOut,
        amountIn: amount,
        swapTodos,
        slippageTolerance,
        AccountId: walletClient.getAddress(),
      });

      // If storage deposit is needed, add it to transactions
      if (!hasStorageIn) {
        transactions.unshift({
          receiverId: inputTokenId,
          functionCalls: [
            {
              methodName: "storage_deposit",
              args: {
                account_id: walletClient.getAddress(),
                registration_only: true,
              },
              gas: "30000000000000",
              amount: FT_MINIMUM_STORAGE_BALANCE_LARGE,
            },
          ],
        });
      }

      if (!hasStorageOut) {
        transactions.unshift({
          receiverId: outputTokenId,
          functionCalls: [
            {
              methodName: "storage_deposit",
              args: {
                account_id: walletClient.getAddress(),
                registration_only: true,
              },
              gas: "30000000000000",
              amount: FT_MINIMUM_STORAGE_BALANCE_LARGE,
            },
          ],
        });
      }

      // Execute transactions
      const results = [];
      for (const tx of transactions) {
        for (const functionCall of tx.functionCalls) {
          const result = await account.functionCall({
            contractId: tx.receiverId,
            methodName: functionCall.methodName,
            args: functionCall.args,
            gas: functionCall.gas,
            attachedDeposit: BigInt(
              functionCall.amount === ONE_YOCTO_NEAR
                ? "1"
                : functionCall.amount
            ),
          });
          results.push(result);
        }
      }

      return {
        success: true,
        transactionHashes: results.map(r => r.transaction.hash),
        inputToken: tokenIn.symbol,
        outputToken: tokenOut.symbol,
        amount: amount
      };
    } catch (error) {
      console.error("Error in swapToken:", error);
      throw error;
    }
  }

  @Tool({
    name: "near_getQuote",
    description: "Get a quote for a cross-chain swap using Defuse",
  })
  async getQuote(walletClient: NEARWalletClient, parameters: CrossChainSwapParameters) {
    return this.makeRPCRequest("quote", [{
      defuse_asset_identifier_in: parameters.defuse_asset_identifier_in,
      defuse_asset_identifier_out: parameters.defuse_asset_identifier_out,
      exact_amount_in: parameters.exact_amount_in,
      network: parameters.network
    }]);
  }

  private async createTokenDiffIntent(
    assetIn: string,
    assetOut: string,
    amountIn: string,
    amountOut: string
  ) {
    return {
      intent: "multi",
      intents: [
        {
          intent: "ft_transfer",
          token: assetIn.replace('nep141:', ''),
          receiver_id: this.settings.defuseContractId,
          amount: amountIn,
          memo: ""
        },
        {
          intent: "ft_receive",
          token: assetOut.replace('nep141:', ''),
          sender_id: this.settings.defuseContractId,
          amount: amountOut,
          memo: ""
        }
      ]
    };
  }

  private async signMessage(keyPair: any, params: {
    message: string;
    recipient: string;
    nonce: Uint8Array;
  }) {
    // Check the nonce is a 32bytes array
    if (params.nonce.byteLength !== 32) {
      throw Error("Expected nonce to be a 32 bytes buffer");
    }

    // Create the payload and sign it
    const payload = new Payload({
      tag: 2147484061,
      message: params.message,
      nonce: Array.from(params.nonce),
      recipient: params.recipient
    });
    
    const borshPayload = Borsh.serialize(payload);
    const hashedPayload = js_sha256.sha256.array(borshPayload);
    const { signature } = keyPair.sign(new Uint8Array(hashedPayload));

    return {
      signature: utils.serialize.base_encode(signature),
      publicKey: utils.serialize.base_encode(keyPair.getPublicKey().data)
    };
  }

  private async publishIntent(params: {
    quote_hashes: string[];
    signed_data: {
      payload: {
        message: string;
        nonce: string;
        recipient: string;
      };
      standard: string;
      signature: string;
      public_key: string;
    };
  }) {
    return this.makeRPCRequest("publish_intent", [params]);
  }

  private async getIntentStatus(intentHash: string) {
    return this.makeRPCRequest<IntentStatus>("get_status", [{
      intent_hash: intentHash
    }]);
  }

  private async pollIntentStatus(intentHash: string): Promise<IntentStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME_MS) {
      const status = await this.getIntentStatus(intentHash);

      if (status.status === "SETTLED" || status.status === "NOT_FOUND_OR_NOT_VALID") {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    throw new Error("Timeout waiting for intent to settle");
  }

  private async depositIntoDefuse(account: any, tokenId: string, amount: bigint) {
    // Check storage balance
    const nep141balance = await this.checkStorageBalance(
      account,
      tokenId
    );

    // Execute storage deposit if needed
    if (!nep141balance) {
      await account.functionCall({
        contractId: tokenId,
        methodName: "storage_deposit",
        args: {
          account_id: account.accountId,
          registration_only: true,
        },
        gas: "30000000000000",
        attachedDeposit: FT_MINIMUM_STORAGE_BALANCE_LARGE,
      });
    }

    // Execute token transfer to defuse contract
    return account.functionCall({
      contractId: tokenId,
      methodName: "ft_transfer_call",
      args: {
        receiver_id: this.settings.defuseContractId,
        amount: amount.toString(),
        msg: "",
      },
      gas: "100000000000000",
      attachedDeposit: "1", // One yocto NEAR
    });
  }

  private async ensurePublicKeyRegistered(account: any, keyPair: any) {
    try {
      // Check if key is already registered
      const publicKey = keyPair.getPublicKey();
      const publicKeyString = `ed25519:${utils.serialize.base_encode(publicKey.data)}`;
      
      // Try to add the public key
      await account.functionCall({
        contractId: this.settings.defuseContractId,
        methodName: "add_public_key",
        args: {
          public_key: publicKeyString
        },
        gas: "300000000000000",
        attachedDeposit: "1" // One yocto NEAR
      });
      
      console.log(`Public key ${publicKeyString} registered`);
    } catch (error) {
      // If error contains "already exists" then it's already registered
      if (String(error).includes("already exists")) {
        console.log("Public key already registered");
        return;
      }
      throw error;
    }
  }

  @Tool({
    name: "near_crossChainSwap",
    description: "Perform a cross-chain swap using Defuse protocol",
  })
  async crossChainSwap(walletClient: NEARWalletClient, parameters: CrossChainSwapParameters) {
    try {
      const { defuse_asset_identifier_in, defuse_asset_identifier_out, exact_amount_in, network = "near" } = parameters;
      
      // Get account
      const account = await walletClient.getAccount();
      const keyPair = walletClient.getKeyPair();
      
      // Ensure public key is registered with the intents contract
      await this.ensurePublicKeyRegistered(account, keyPair);
      
      // Check and deposit tokens if needed
      const tokenIdIn = defuse_asset_identifier_in.startsWith('nep141:') 
        ? defuse_asset_identifier_in.replace('nep141:', '')
        : defuse_asset_identifier_in;
        
      const amountInBigInt = BigInt(exact_amount_in);
      
      // We need to deposit into defuse if the token is not already there
      await this.depositIntoDefuse(account, tokenIdIn, amountInBigInt);

      // Get quote for the swap
      const quote = await this.getQuote(walletClient, parameters);
      
      if (!Array.isArray(quote) || quote.length === 0) {
        throw new Error("Failed to get quote from Defuse");
      }
      
      const quoteData = quote[0];
      
      // Create intent message for the swap
      const intentMessage: IntentMessage = {
        signer_id: account.accountId,
        deadline: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
        intents: [
          await this.createTokenDiffIntent(
            quoteData.defuse_asset_identifier_in,
            quoteData.defuse_asset_identifier_out,
            quoteData.amount_in,
            quoteData.amount_out
          )
        ]
      };
      
      // Sign the message
      const messageString = JSON.stringify(intentMessage);
      const nonce = new Uint8Array(crypto.randomBytes(32));
      const recipient = this.settings.defuseContractId || "intents.near";
      
      const { signature, publicKey } = await this.signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
      });
      
      // Publish the intent
      const intent = await this.publishIntent({
        quote_hashes: [quoteData.quote_hash],
        signed_data: {
          payload: {
            message: messageString,
            nonce: Buffer.from(nonce).toString('base64'),
            recipient
          },
          standard: "nep413",
          signature: `ed25519:${signature}`,
          public_key: `ed25519:${publicKey}`
        }
      });
      
      if (intent.status === "OK") {
        // Poll for the status until settled
        const finalStatus = await this.pollIntentStatus(intent.intent_hash);
        
        return {
          success: true,
          status: finalStatus.status,
          intentHash: intent.intent_hash,
          transactionHash: finalStatus.data?.hash,
          inputToken: defuse_asset_identifier_in,
          outputToken: defuse_asset_identifier_out,
          inputAmount: exact_amount_in,
          outputAmount: quoteData.amount_out,
          network: network
        };
      }
      
      return {
        success: false,
        status: intent.status,
        intentHash: intent.intent_hash,
        error: "Intent publication did not return OK status",
        inputToken: defuse_asset_identifier_in,
        outputToken: defuse_asset_identifier_out
      };
    } catch (error) {
      console.error("Error in crossChainSwap:", error);
      return {
        success: false,
        error: String(error),
        inputToken: parameters.defuse_asset_identifier_in,
        outputToken: parameters.defuse_asset_identifier_out
      };
    }
  }
  
  @Tool({
    name: "near_crossChainSwapAndWithdraw",
    description: "Perform a cross-chain swap and withdraw tokens to an external address",
  })
  async crossChainSwapAndWithdraw(walletClient: NEARWalletClient, parameters: CrossChainSwapParameters & { destination_address: string }) {
    try {
      // First perform the swap
      const swapResult = await this.crossChainSwap(walletClient, parameters);
      
      if (!swapResult.success) {
        return swapResult;
      }
      
      // Now handle the withdrawal
      const { defuse_asset_identifier_out, destination_address, network = "near" } = parameters;
      const account = await walletClient.getAccount();
      const keyPair = walletClient.getKeyPair();
      
      // Generate nonce for the withdraw intent
      const nonce = new Uint8Array(crypto.randomBytes(32));
      
      // Create intent message for the withdrawal
      const intentMessage: IntentMessage = {
        signer_id: account.accountId,
        deadline: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
        intents: [{
          intent: "ft_withdraw",
          token: defuse_asset_identifier_out.replace('nep141:', ''),
          receiver_id: defuse_asset_identifier_out.replace('nep141:', ''),
          amount: swapResult.outputAmount,
          memo: network !== 'near' ? `WITHDRAW_TO:${destination_address}` : ''
        }]
      };
      
      const messageString = JSON.stringify(intentMessage);
      const recipient = this.settings.defuseContractId || "intents.near";
      
      // Sign the message
      const { signature, publicKey } = await this.signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
      });
      
      // Publish the intent
      const withdrawIntent = await this.publishIntent({
        quote_hashes: [], // Empty for withdrawals
        signed_data: {
          payload: {
            message: messageString,
            nonce: Buffer.from(nonce).toString('base64'),
            recipient
          },
          standard: "nep413",
          signature: `ed25519:${signature}`,
          public_key: `ed25519:${publicKey}`
        }
      });
      
      if (withdrawIntent.status === "OK") {
        // Poll for the status until settled
        const finalStatus = await this.pollIntentStatus(withdrawIntent.intent_hash);
        
        return {
          success: true,
          swapStatus: swapResult.status,
          withdrawStatus: finalStatus.status,
          swapIntentHash: swapResult.intentHash,
          withdrawIntentHash: withdrawIntent.intent_hash,
          swapTransactionHash: swapResult.transactionHash,
          withdrawTransactionHash: finalStatus.data?.hash,
          inputToken: parameters.defuse_asset_identifier_in,
          outputToken: parameters.defuse_asset_identifier_out,
          inputAmount: parameters.exact_amount_in,
          outputAmount: swapResult.outputAmount,
          destination: destination_address,
          network: network
        };
      }
      
      return {
        success: false,
        swapStatus: swapResult.status,
        withdrawStatus: withdrawIntent.status,
        error: "Withdrawal intent publication did not return OK status",
        swapIntentHash: swapResult.intentHash,
        withdrawIntentHash: withdrawIntent.intent_hash
      };
    } catch (error) {
      console.error("Error in crossChainSwapAndWithdraw:", error);
      return {
        success: false,
        error: String(error),
        inputToken: parameters.defuse_asset_identifier_in,
        outputToken: parameters.defuse_asset_identifier_out,
        destination: parameters.destination_address
      };
    }
  }
}