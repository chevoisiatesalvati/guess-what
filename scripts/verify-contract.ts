import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Read the network from command line args (baseSepolia or base)
const network = process.argv[2] || 'baseSepolia';
const chainId = network === 'base' ? '8453' : '84532';

try {
  // Read the deployed address from the ignition deployment file
  const deploymentPath = `./ignition/deployments/chain-${chainId}/deployed_addresses.json`;
  const deploymentData = JSON.parse(readFileSync(deploymentPath, 'utf-8'));
  const contractAddress = deploymentData['GuessWhatGameModule#GuessWhatGame'];

  if (!contractAddress) {
    console.error('❌ Contract address not found in deployment file');
    process.exit(1);
  }

  console.log(`🔍 Verifying contract at ${contractAddress} on ${network}...`);

  // Run the verification command
  const command = `npx hardhat verify --network ${network} --constructor-args-path lib/constructor-args.ts ${contractAddress}`;
  execSync(command, { stdio: 'inherit' });

  console.log('✅ Verification complete!');
} catch (error: any) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}
