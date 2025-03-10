import { Chain } from "viem/chains";

// Define Sonic Blaze Testnet chain
export const sonicBlazeTestnet = {
    id: 57054,
    name: 'Sonic Blaze Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Sonic',
        symbol: 'S',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.blaze.soniclabs.com'],
        },
        public: {
            http: ['https://rpc.blaze.soniclabs.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'SonicScan',
            url: 'https://testnet.sonicscan.org',
        },
    },
    testnet: true,
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 1,
        },
    },
} as const satisfies Chain;

// Export single chain
export const chains = {
    sonic: sonicBlazeTestnet,
};

// Single chain mapping
const CHAIN_MAP: Record<string, keyof typeof chains> = {
    "57054": "sonic"
};
  
export const selectChain = (chainId: string) => {
    return chains[CHAIN_MAP[chainId] || "sonic"];
};

export const chainList = [{
    label: sonicBlazeTestnet.name,
    value: sonicBlazeTestnet.id.toString(),
}];