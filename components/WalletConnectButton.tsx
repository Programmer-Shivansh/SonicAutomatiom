"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "./providers/WalletProvider";
import { Loader2, WalletIcon } from "lucide-react";
import { useState } from "react";
import { formatAddress } from "@/lib/utils";

export default function WalletConnectButton() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <>
      {isConnected && address ? (
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">{formatAddress(address)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="border-primary/20 hover:bg-primary/5"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleConnect} 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <WalletIcon className="h-4 w-4" />
          )}
          Connect Wallet
        </Button>
      )}
    </>
  );
} 