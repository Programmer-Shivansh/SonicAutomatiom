"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CoinsIcon, Loader2Icon, WalletIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "./providers/WalletProvider";
import { formatEther } from "viem";
import { sonicBlazeTestnet } from "@/lib/chains";
import { createPublicClient, http } from "viem";

// Sonic token contract
const SONIC_TOKEN = {
  address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
  decimals: 18,
  symbol: "SONIC"
};

// Native token symbol
const NATIVE_SYMBOL = "S";

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

function UserAvailableCreditsBadge() {
  const { isConnected, address, connectWallet: connectWalletFn } = useWallet();
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  
  useEffect(() => {
    const fetchBalances = async () => {
      console.log('fetchBalances called - isConnected:', isConnected, 'address:', address);
      
      if (!isConnected || !address) {
        console.log('Not connected or no address - resetting balances');
        setNativeBalance(null);
        setTokenBalance(null);
        return;
      }

      try {
        console.log('Creating public client with chain:', sonicBlazeTestnet.id);
        const publicClient = createPublicClient({
          chain: sonicBlazeTestnet,
          transport: http(sonicBlazeTestnet.rpcUrls.default.http[0])
        });

        // Fetch native balance
        console.log('Fetching native balance for address:', address);
        const nativeResult = await publicClient.getBalance({
          address: address as `0x${string}`
        });
        console.log('Raw native balance result:', nativeResult);
        const formattedNative = formatEther(nativeResult);
        console.log('Formatted native balance:', formattedNative);
        setNativeBalance(formattedNative);

        // Fetch token balance
        console.log('Fetching token balance for address:', address);
        const tokenResult = await publicClient.readContract({
          address: SONIC_TOKEN.address as `0x${string}`,
          abi: tokenABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        });
        console.log('Raw token balance result:', tokenResult);
        const formattedToken = formatEther(tokenResult as bigint);
        console.log('Formatted token balance:', formattedToken);
        setTokenBalance(formattedToken);
      } catch (error) {
        console.error("Error fetching balances:", error);
        setNativeBalance(null);
        setTokenBalance(null);
      }
    };

    console.log('Starting balance fetch');
    fetchBalances();

    // Refresh balances every 30 seconds
    const interval = setInterval(() => {
      console.log('Interval triggered - fetching balances');
      fetchBalances();
    }, 30000);
    
    return () => {
      console.log('Cleaning up interval');
      clearInterval(interval);
    };
  }, [isConnected, address]);
  
  const handleConnectWallet = async () => {
    console.log('handleConnectWallet called');
    setIsConnecting(true);
    try {
      await connectWalletFn();
      console.log('Wallet connected successfully');
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Simulate token purchase
  const buyTokens = () => {
    console.log('buyTokens called');
    setIsPurchasing(true);
    setTimeout(() => {
      setPurchaseComplete(true);
      setIsPurchasing(false);
      console.log('Purchase simulation complete');
    }, 2000);
  };

  console.log('Current state - nativeBalance:', nativeBalance, 'tokenBalance:', tokenBalance);
  const formattedTokenBalance = tokenBalance ? parseFloat(tokenBalance).toFixed(2) : "0";
  const formattedNativeBalance = nativeBalance ? parseFloat(nativeBalance).toFixed(2) : "0";
  console.log('Formatted balances - native:', formattedNativeBalance, 'token:', formattedTokenBalance);
  const shortenedAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                  buttonVariants({ variant: "glass" })
                )}
                disabled={isConnecting}
              >
                <WalletIcon size={20} className="text-accent shrink-0" />
                <span className="font-semibold">
                  {isConnecting ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    "Connect Wallet"
                  )}
                </span>
              </button>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" className="px-2 py-0.5 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    {shortenedAddress}
                  </Badge>
                  
                  <span className="text-xs font-medium flex items-center gap-1">
                    <CoinsIcon className="w-3 h-3 text-accent" />
                    {formattedTokenBalance} {SONIC_TOKEN.symbol}
                  </span>
                </div>
                
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-xs text-muted-foreground">Native Balance:</span>
                  <span className="text-xs font-medium">{formattedNativeBalance} {NATIVE_SYMBOL}</span>
                </div>
                
                <button
                  onClick={buyTokens}
                  disabled={isPurchasing || purchaseComplete}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl transition-all",
                    buttonVariants({ 
                      variant: purchaseComplete ? "default" : "accent", 
                      size: "default" 
                    })
                  )}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : purchaseComplete ? (
                    <>
                      <CoinsIcon className="w-4 h-4" />
                      <span>Purchase Complete!</span>
                    </>
                  ) : (
                    <>
                      <CoinsIcon className="w-4 h-4" />
                      <span>Buy {SONIC_TOKEN.symbol} Tokens</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {isConnected ? (
              <p>{formattedTokenBalance} {SONIC_TOKEN.symbol} tokens available</p>
            ) : (
              <p>Connect to see your {SONIC_TOKEN.symbol} tokens</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserAvailableCreditsBadge;