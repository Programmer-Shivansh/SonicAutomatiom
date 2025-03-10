"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useWallet } from "./providers/WalletProvider";
import { createPublicClient, createWalletClient, custom, parseEther, formatEther } from "viem";
import { sonicBlazeTestnet } from "@/lib/chains";
import { GeckoTerminalPlugin } from "@/lib/goat-plugins/gecko-terminal-plugin";

const SONIC_TOKEN = {
  name: "Sonic Token",
  symbol: "SONIC",
  address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38" as `0x${string}`,
  decimals: 18
};

type TransactionStatus = "idle" | "pending" | "success" | "error";

export default function TokenPurchase() {
  const { isConnected, address } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // You'll need to get the correct pool address for SONIC token on Sonic Blaze Testnet
  const POOL_ADDRESS = "0xYOUR_POOL_ADDRESS_HERE" as `0x${string}`; // Replace with actual pool address

  useEffect(() => {
    const fetchTokenPrice = async () => {
      setIsLoadingPrice(true);
      try {
        const geckoTerminal = new GeckoTerminalPlugin();
        const tools = geckoTerminal.getTools();
        const getPrice = tools.find(t => t.name === "getTokenPrice");
        
        if (getPrice) {
          const response = await getPrice.execute({ 
            tokenAddress: SONIC_TOKEN.address,
            poolAddress: POOL_ADDRESS // Added required poolAddress
          });
          const data = JSON.parse(response);
          
          if (data.data?.attributes?.price_usd) {
            setTokenPrice(parseFloat(data.data.attributes.price_usd));
          }
        }
      } catch (error) {
        console.error("Error fetching token price:", error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchTokenPrice();
    const interval = setInterval(fetchTokenPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const getTokenAmount = () => {
    if (!tokenPrice || !amount) return 0;
    const amountInUSD = parseFloat(amount);
    return amountInUSD / tokenPrice;
  };

  const handlePurchase = async () => {
    if (!isConnected || !address || !window.ethereum) {
      alert("Please connect your wallet first");
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setStatus("pending");
      setErrorMessage("");

      const walletClient = createWalletClient({
        chain: sonicBlazeTestnet,
        transport: custom(window.ethereum)
      });

      const publicClient = createPublicClient({
        chain: sonicBlazeTestnet,
        transport: custom(window.ethereum)
      });

      const tokenABI = [
        {
          "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}],
          "name": "buy",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ];

      const { request } = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: SONIC_TOKEN.address,
        abi: tokenABI,
        functionName: 'buy',
        args: [address as `0x${string}`],
        value: parseEther(amount)
      });

      const hash = await walletClient.writeContract({
        ...request,
        account: address as `0x${string}` // Added account explicitly
      });

      setTxHash(hash);
      setStatus("success");

      await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      console.error("Transaction error:", error);
      setStatus("error");
      setErrorMessage((error as Error).message || "Transaction failed");
    }
  };

  const resetForm = () => {
    setAmount("");
    setStatus("idle");
    setTxHash("");
    setErrorMessage("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Buy {SONIC_TOKEN.name}</CardTitle>
        <CardDescription>
          Purchase {SONIC_TOKEN.symbol} tokens with your wallet
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "success" ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 flex flex-col items-center justify-center space-y-3 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">Purchase Successful!</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Your transaction has been submitted
              </p>
            </div>
            {txHash && (
              <a
                href={`${sonicBlazeTestnet.blockExplorers?.default.url}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-primary"
              >
                View transaction on explorer
              </a>
            )}
          </div>
        ) : status === "error" ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 flex flex-col items-center justify-center space-y-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">Transaction Failed</p>
              {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 break-all">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (S)</Label>
              <Input
                id="amount"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                disabled={status === "pending" || !isConnected}
                className="text-lg"
              />
            </div>

            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex justify-between text-sm">
                <span>Token price:</span>
                <span>
                  {isLoadingPrice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    tokenPrice ? `$${tokenPrice.toFixed(6)}` : "N/A"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>You will receive:</span>
                <span>{getTokenAmount().toFixed(6)} {SONIC_TOKEN.symbol}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        {status === "idle" || status === "pending" ? (
          <Button
            className="w-full"
            onClick={status === "idle" ? handlePurchase : undefined}
            disabled={!isConnected || !amount || status === "pending" || !tokenPrice}
          >
            {status === "pending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !isConnected ? (
              "Connect Wallet to Buy"
            ) : (
              "Buy Tokens"
            )}
          </Button>
        ) : (
          <Button className="w-full" onClick={resetForm} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Make Another Purchase
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}