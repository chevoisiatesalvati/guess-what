const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying GuessWhatGame contract...');

  const GuessWhatGame = await ethers.getContractFactory('GuessWhatGame');
  const game = await GuessWhatGame.deploy();

  await game.waitForDeployment();

  const address = await game.getAddress();
  console.log('GuessWhatGame deployed to:', address);

  // Verify contract on BaseScan
  console.log('Contract deployed successfully!');
  console.log('Address:', address);
  console.log('Network:', network.name);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: address,
    network: network.name,
    timestamp: new Date().toISOString(),
  };

  require('fs').writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('Deployment info saved to deployment.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
