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
  console.log('🔄 Checking contract addresses from deployment files...');

  const envPath = path.join(__dirname, '..', '.env');
  const networkConfigPath = path.join(
    __dirname,
    '..',
    'lib',
    'network-config.ts'
  );

  let envContent = '';
  let networkConfigContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Read network-config.ts file
  if (fs.existsSync(networkConfigPath)) {
    networkConfigContent = fs.readFileSync(networkConfigPath, 'utf-8');
  }

  let updated = false;
  let skipped = 0;

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

        // Update the address in the .env file
        const envVarName =
          chainId === '8453'
            ? 'BASE_CONTRACT_ADDRESS'
            : 'BASE_SEPOLIA_CONTRACT_ADDRESS';
        const chainName = chainId === '8453' ? 'Base Mainnet' : 'Base Sepolia';

        // Check if the address is already up-to-date
        const currentAddressPattern = new RegExp(`${envVarName}=([^\\n]*)`);
        const currentMatch = envContent.match(currentAddressPattern);
        const currentAddress = currentMatch ? currentMatch[1] : null;

        if (currentAddress === contractAddress) {
          console.log(
            `⏭️ Skipping ${chainName} - address already up to date (${contractAddress})`
          );
          skipped++;
          continue;
        }

        // Update or add the environment variable in .env
        const envVarPattern = new RegExp(`^${envVarName}=.*$`, 'm');
        const newEnvVar = `${envVarName}=${contractAddress}`;

        if (envContent.match(envVarPattern)) {
          // Update existing variable
          envContent = envContent.replace(envVarPattern, newEnvVar);
        } else {
          // Add new variable
          envContent += envContent.endsWith('\n') ? '' : '\n';
          envContent += `${newEnvVar}\n`;
        }

        // Update the hardcoded address in network-config.ts
        const chainIdNum = parseInt(chainId);
        const isBaseMainnet = chainIdNum === 8453;
        const configPattern = new RegExp(
          `(\\[${
            isBaseMainnet ? 'base\\.id' : 'baseSepolia\\.id'
          }\\]: ')[^']*('.*?// ${chainName})`
        );

        if (networkConfigContent.match(configPattern)) {
          networkConfigContent = networkConfigContent.replace(
            configPattern,
            `$1${contractAddress}$2`
          );
        }

        updated = true;
        console.log(
          `✅ Updated ${chainName} contract address from ${
            currentAddress || 'not set'
          } to ${contractAddress}`
        );
        console.log(`   📝 Updated in .env file`);
        console.log(`   📝 Updated in network-config.ts`);
      } else {
        console.log(`⚠️ No contract address found in ${deploymentPath}`);
      }
    } else {
      console.log(`⚠️ Deployment file not found: ${deploymentPath}`);
    }
  }

  if (updated) {
    // Write both files
    fs.writeFileSync(envPath, envContent);
    fs.writeFileSync(networkConfigPath, networkConfigContent);
    console.log(
      '✅ Contract addresses updated in both .env and network-config.ts!'
    );
  } else if (skipped > 0) {
    console.log(
      `ℹ️ No updates needed - ${skipped} addresses already up to date`
    );
  } else {
    console.log('ℹ️ No updates needed - addresses are already up to date');
  }
}

// Run the update
updateContractAddresses();
