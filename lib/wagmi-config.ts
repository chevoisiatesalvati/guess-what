import { farcasterFrame as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import {
  getCurrentChain,
  getCurrentChainId,
  getCurrentRpcUrl,
  getSupportedChains,
  RPC_URLS,
} from '@/lib/network-config';

// Get the current chain and RPC URL based on environment
const currentChain = getCurrentChain();
const currentChainId = getCurrentChainId();
const currentRpcUrl = getCurrentRpcUrl();

console.log(
  '🔧 Wagmi Config - Chain:',
  currentChain.name,
  'Chain ID:',
  currentChainId
);
console.log('🔧 Wagmi Config - RPC URL:', currentRpcUrl);

export const config = createConfig({
  chains: [getCurrentChain()], // Only support the current environment's chain
  transports: {
    [getCurrentChainId()]: http(getCurrentRpcUrl()),
  },
  connectors: [miniAppConnector()],
});
