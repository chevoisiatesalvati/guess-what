#!/usr/bin/env node

/**
 * Script to automatically update contract addresses in network-config.ts
 * after deployment using Hardhat Ignition
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chain ID to deployment directory mapping
const CHAIN_DEPLOYMENTS = {
  8453: 'chain-8453', // Base Mainnet
  84532: 'chain-84532', // Base Sepolia
};

function updateContractAddresses() {
  console.log('🔄 Updating contract addresses from deployment files...');

  const networkConfigPath = path.join(
    __dirname,
    '..',
    'lib',
    'network-config.ts'
  );
  let networkConfig = fs.readFileSync(networkConfigPath, 'utf-8');

  let updated = false;

  // Update addresses for each chain
  for (const [chainId, deploymentDir] of Object.entries(CHAIN_DEPLOYMENTS)) {
    const deploymentPath = path.join(
      __dirname,
      '..',
      'ignition',
      'deployments',
      deploymentDir,
      'deployed_addresses.json'
    );

    if (fs.existsSync(deploymentPath)) {
      const deployedAddresses = JSON.parse(
        fs.readFileSync(deploymentPath, 'utf-8')
      );
      const contractAddress =
        deployedAddresses['GuessWhatGameModule#GuessWhatGame'];

      if (contractAddress) {
        console.log(
          `📋 Found contract address for chain ${chainId}: ${contractAddress}`
        );

        // Update the address in the network config
        const chainName = chainId === '8453' ? 'base' : 'baseSepolia';

        // Only update CONTRACT_ADDRESSES, not RPC_URLS
        const contractAddressPattern = new RegExp(
          `(CONTRACT_ADDRESSES = \\{[^}]*\\[${chainName}\\.id\\]: ')[^']*('.*?\\} as const;)`,
          's'
        );

        if (networkConfig.match(contractAddressPattern)) {
          networkConfig = networkConfig.replace(
            contractAddressPattern,
            `$1${contractAddress}$2`
          );
          updated = true;
          console.log(
            `✅ Updated ${chainName} contract address to ${contractAddress}`
          );
        }
      } else {
        console.log(`⚠️ No contract address found in ${deploymentPath}`);
      }
    } else {
      console.log(`⚠️ Deployment file not found: ${deploymentPath}`);
    }
  }

  if (updated) {
    fs.writeFileSync(networkConfigPath, networkConfig);
    console.log('✅ Contract addresses updated successfully!');
  } else {
    console.log('ℹ️ No updates needed - addresses are already up to date');
  }
}

// Run the update
updateContractAddresses();
