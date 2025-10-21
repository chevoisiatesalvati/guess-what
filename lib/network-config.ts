import { base, baseSepolia } from 'viem/chains';
import { http } from 'viem';
import { env } from '@/lib/env';
import type { Chain } from 'viem';

/**
 * Network configuration based on environment
 * Production -> Base Mainnet
 * Development -> Base Sepolia
 */

// Contract addresses for each network
// These are loaded from the deployment files and updated when contracts are redeployed
export const CONTRACT_ADDRESSES = {
  [base.id]: '0xC85Dc6C4a2d1b2f8e4842D8737DE06425E35919A', // Base Mainnet
  [baseSepolia.id]: '0xf4F689091F30EB77Ea9575Be919A762b418E12c7', // Base Sepolia
} as const;

// RPC URLs for each network
export const RPC_URLS = {
  [base.id]: 'https://mainnet.base.org',
  [baseSepolia.id]: 'https://base-sepolia.drpc.org',
} as const;

/**
 * Get the current chain based on environment
 */
export function getCurrentChain(): Chain {
  const isProduction = env.NEXT_PUBLIC_APP_ENV === 'production';
  return isProduction ? base : baseSepolia;
}

/**
 * Get the current chain ID
 */
export function getCurrentChainId(): number {
  return getCurrentChain().id;
}

/**
 * Get the contract address for the current environment
 */
export function getCurrentContractAddress(): `0x${string}` {
  const chainId = getCurrentChainId();
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
}

/**
 * Get the RPC URL for the current environment
 */
export function getCurrentRpcUrl(): string {
  const chainId = getCurrentChainId();
  return RPC_URLS[chainId as keyof typeof RPC_URLS];
}

/**
 * Get the HTTP transport for the current chain
 */
export function getCurrentTransport() {
  return http(getCurrentRpcUrl());
}

/**
 * Get all supported chains (useful for wagmi config)
 */
export function getSupportedChains(): [Chain, ...Chain[]] {
  return [base, baseSepolia];
}

/**
 * Get the chain name for display purposes
 */
export function getCurrentChainName(): string {
  const chain = getCurrentChain();
  return chain.name;
}

/**
 * Get the block explorer URL for the current chain
 */
export function getBlockExplorerUrl(): string {
  const chain = getCurrentChain();
  return chain.blockExplorers?.default.url || 'https://basescan.org';
}

/**
 * Check if we're on production (Base Mainnet)
 */
export function isProduction(): boolean {
  return env.NEXT_PUBLIC_APP_ENV === 'production';
}

/**
 * Check if we're on development (Base Sepolia)
 */
export function isDevelopment(): boolean {
  return env.NEXT_PUBLIC_APP_ENV === 'development';
}

/**
 * Update contract addresses after deployment
 * This function should be called after deploying new contracts
 * to update the addresses in the deployed_addresses.json files
 */
export function updateContractAddresses() {
  console.log('📋 Contract addresses:');
  console.log(`Base Mainnet (${base.id}): ${CONTRACT_ADDRESSES[base.id]}`);
  console.log(
    `Base Sepolia (${baseSepolia.id}): ${CONTRACT_ADDRESSES[baseSepolia.id]}`
  );
  console.log(
    '💡 To update addresses after deployment, manually update this file with new addresses from ignition/deployments/'
  );
}
