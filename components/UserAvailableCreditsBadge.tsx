"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CoinsIcon, Loader2Icon, WalletIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// HARDCODED VALUES - USED THROUGHOUT THE CODEBASE
const HARDCODED_VALUES = {
  account: "0xf3B217C83E2205B8BE5A3F8F1F5AF6EcAf7B78A2",
  nativeBalance: "8.7", // Exact value as requested
  tokenBalance: 120,     // Exact value as requested
  tokenSymbol: "S"
};

function UserAvailableCreditsBadge() {
  // Simple states for UI interactions - no blockchain dependencies
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  
  // Simple mock connection with hardcoded values
  const connectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1200);
  };
  
  // Simulate token purchase
  const buyTokens = () => {
    setIsPurchasing(true);
    setTimeout(() => {
      setPurchaseComplete(true);
      setIsPurchasing(false);
    }, 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            {!isConnected ? (
              <button
                onClick={connectWallet}
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
                    {HARDCODED_VALUES.account.substring(0, 6)}...{HARDCODED_VALUES.account.substring(HARDCODED_VALUES.account.length - 4)}
                  </Badge>
                  
                  <span className="text-xs font-medium flex items-center gap-1">
                    <CoinsIcon className="w-3 h-3 text-accent" />
                    {HARDCODED_VALUES.tokenBalance} {HARDCODED_VALUES.tokenSymbol}
                  </span>
                </div>
                
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-xs text-muted-foreground">Native Balance:</span>
                  <span className="text-xs font-medium">{HARDCODED_VALUES.nativeBalance} {HARDCODED_VALUES.tokenSymbol}</span>
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
                      <span>Buy {HARDCODED_VALUES.tokenSymbol} Tokens</span>
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
              <p>{HARDCODED_VALUES.tokenBalance} {HARDCODED_VALUES.tokenSymbol} tokens available</p>
            ) : (
              <p>Connect to see your {HARDCODED_VALUES.tokenSymbol} tokens</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserAvailableCreditsBadge;
