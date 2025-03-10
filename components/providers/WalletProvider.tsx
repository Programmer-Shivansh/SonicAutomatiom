"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sonicBlazeTestnet } from '@/lib/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, injected, walletConnect } from 'wagmi/connectors';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Create a React Query client
const queryClient = new QueryClient();

// Create wagmi config with Sonic chain
const config = createConfig({
  chains: [sonicBlazeTestnet],
  transports: {
    [sonicBlazeTestnet.id]: http(sonicBlazeTestnet.rpcUrls.default.http[0]),
  },
  connectors: [
    metaMask(),
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
    }),
  ],
});

// Create wallet context for easy access to wallet state
type WalletContextType = {
  isConnected: boolean;
  address: string | undefined;
  connectWallet: () => void;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: undefined,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Request to switch to Sonic network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${sonicBlazeTestnet.id.toString(16)}` }],
          });
        } catch (switchError) {
          // Chain doesn't exist, add it
          if ((switchError as any).code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${sonicBlazeTestnet.id.toString(16)}`,
                  chainName: sonicBlazeTestnet.name,
                  nativeCurrency: {
                    name: sonicBlazeTestnet.nativeCurrency.name,
                    symbol: sonicBlazeTestnet.nativeCurrency.symbol,
                    decimals: sonicBlazeTestnet.nativeCurrency.decimals,
                  },
                  rpcUrls: sonicBlazeTestnet.rpcUrls.default.http,
                  blockExplorerUrls: [sonicBlazeTestnet.blockExplorers?.default.url],
                },
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAddress(undefined);
    setIsConnected(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Disconnected
          setIsConnected(false);
          setAddress(undefined);
        } else {
          // Account changed
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(console.error);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletContext.Provider value={{ isConnected, address, connectWallet, disconnectWallet }}>
          {children}
        </WalletContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 