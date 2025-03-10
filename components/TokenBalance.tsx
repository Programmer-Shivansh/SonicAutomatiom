"use client";

import { useWallet } from "./providers/WalletProvider";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { sonicBlazeTestnet } from "@/lib/chains";
import { createPublicClient, http } from "viem";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Coins } from "lucide-react";

// Sonic token contract
const SONIC_TOKEN = {
  address: "0x9f1a2c33088f7a8c19f3ffb70b8666f9dad72f77",
  decimals: 18
};

// Token ABI for balanceOf
const tokenABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function TokenBalance() {
  const { isConnected, address } = useWallet();
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) {
        setNativeBalance(null);
        setTokenBalance(null);
        return;
      }

      setIsLoading(true);
      try {
        const publicClient = createPublicClient({
          chain: sonicBlazeTestnet,
          transport: http(sonicBlazeTestnet.rpcUrls.default.http[0])
        });

        // Fetch native balance
        const nativeResult = await publicClient.getBalance({
          address: address as `0x${string}`
        });
        setNativeBalance(formatEther(nativeResult));

        // Fetch token balance
        const tokenResult = await publicClient.readContract({
          address: SONIC_TOKEN.address as `0x${string}`,
          abi: tokenABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        });
        setTokenBalance(formatEther(tokenResult));
      } catch (error) {
        console.error("Error fetching balances:", error);
        setNativeBalance(null);
        setTokenBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();

    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-none">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Native Balance</p>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <p className="font-medium">{nativeBalance ? `${parseFloat(nativeBalance).toFixed(4)} S` : "N/A"}</p>
            )}
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        <div>
          <p className="text-xs text-muted-foreground">Token Balance</p>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="font-medium">{tokenBalance ? `${parseFloat(tokenBalance).toFixed(4)} SONIC` : "N/A"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 