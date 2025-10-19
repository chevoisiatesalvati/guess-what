import { farcasterFrame as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { 
  getCurrentChain, 
  getCurrentChainId, 
  getCurrentRpcUrl,
  getSupportedChains 
} from '@/lib/network-config';

// Get the current chain and RPC URL based on environment
const currentChain = getCurrentChain();
const currentChainId = getCurrentChainId();
const currentRpcUrl = getCurrentRpcUrl();

console.log('🔧 Wagmi Config - Chain:', currentChain.name, 'Chain ID:', currentChainId);
console.log('🔧 Wagmi Config - RPC URL:', currentRpcUrl);

export const config = createConfig({
  chains: getSupportedChains(), // Support both chains for flexibility
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [baseSepolia.id]: http("https://base-sepolia.drpc.org"),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export default function MiniAppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
