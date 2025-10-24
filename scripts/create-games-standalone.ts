import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { config } from 'dotenv';
import { hashWord } from '../lib/utils';

// Load environment variables
config();

// Contract ABI (createGame function, treasury balance check, and fundTreasury)
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_topWord', type: 'string' },
      { internalType: 'bytes32', name: '_middleWordHash', type: 'bytes32' },
      { internalType: 'uint256', name: '_middleWordLength', type: 'uint256' },
      { internalType: 'string', name: '_bottomWord', type: 'string' },
      { internalType: 'uint256', name: '_entryFee', type: 'uint256' },
    ],
    name: 'createGame',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'treasuryBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultPrizeMultiplier',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fundTreasury',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Contract address from environment variable
const CONTRACT_ADDRESS = process.env
  .BASE_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`;

// Sample word combinations for games - proper logical associations
const GAME_COMBINATIONS = [
  {
    topWord: 'Cat',
    middleWord: 'Animal',
    middleWordLength: 6,
    bottomWord: 'Dog',
  },
  {
    topWord: 'Satoshi',
    middleWord: 'Cryptocurrency',
    middleWordLength: 13,
    bottomWord: 'Bitcoin',
  },
  {
    topWord: 'Apple',
    middleWord: 'Fruit',
    middleWordLength: 5,
    bottomWord: 'Orange',
  },
  {
    topWord: 'Tesla',
    middleWord: 'Electric',
    middleWordLength: 8,
    bottomWord: 'Nissan',
  },
  {
    topWord: 'Facebook',
    middleWord: 'Social',
    middleWordLength: 6,
    bottomWord: 'Twitter',
  },
  {
    topWord: 'Google',
    middleWord: 'Search',
    middleWordLength: 6,
    bottomWord: 'Bing',
  },
  {
    topWord: 'Netflix',
    middleWord: 'Streaming',
    middleWordLength: 9,
    bottomWord: 'Disney',
  },
  {
    topWord: 'Uber',
    middleWord: 'Ride',
    middleWordLength: 4,
    bottomWord: 'Lyft',
  },
  {
    topWord: 'Spotify',
    middleWord: 'Music',
    middleWordLength: 5,
    bottomWord: 'Apple',
  },
  {
    topWord: 'Amazon',
    middleWord: 'Ecommerce',
    middleWordLength: 9,
    bottomWord: 'Shopify',
  },
  {
    topWord: 'Microsoft',
    middleWord: 'Software',
    middleWordLength: 8,
    bottomWord: 'Adobe',
  },
  {
    topWord: 'Nike',
    middleWord: 'Sport',
    middleWordLength: 5,
    bottomWord: 'Adidas',
  },
  {
    topWord: 'McDonald',
    middleWord: 'Fast',
    middleWordLength: 4,
    bottomWord: 'KFC',
  },
  {
    topWord: 'Coca',
    middleWord: 'Cola',
    middleWordLength: 4,
    bottomWord: 'Pepsi',
  },
  {
    topWord: 'BMW',
    middleWord: 'Luxury',
    middleWordLength: 6,
    bottomWord: 'Mercedes',
  },
];

// Function to fund the treasury
async function fundTreasury(
  walletClient: any,
  publicClient: any,
  amount: bigint
) {
  try {
    console.log(
      `💰 Funding treasury with ${(Number(amount) / 1e18).toFixed(6)} ETH...`
    );

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'fundTreasury',
      value: amount,
    });

    console.log(`   📝 Transaction hash: ${hash}`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      console.log(`   ✅ Treasury funded successfully!`);
      return true;
    } else {
      console.log(`   ❌ Treasury funding failed`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to fund treasury:', error);
    return false;
  }
}

// Function to check treasury balance and requirements
async function checkTreasuryBalance(publicClient: any, entryFee: bigint) {
  try {
    console.log('🔍 Checking treasury balance and requirements...');

    // Get treasury balance
    const treasuryBalance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'treasuryBalance',
    });

    // Get prize multiplier
    const prizeMultiplier = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'defaultPrizeMultiplier',
    });

    // Calculate required balance for one game
    const requiredBalance = entryFee * prizeMultiplier;

    console.log(
      `💰 Treasury Balance: ${(Number(treasuryBalance) / 1e18).toFixed(6)} ETH`
    );
    console.log(`🎯 Entry Fee: ${(Number(entryFee) / 1e18).toFixed(6)} ETH`);
    console.log(`📊 Prize Multiplier: ${prizeMultiplier}x`);
    console.log(
      `💎 Required Balance: ${(Number(requiredBalance) / 1e18).toFixed(6)} ETH`
    );

    if (treasuryBalance >= requiredBalance) {
      console.log(`✅ Treasury has sufficient balance for game creation!`);
      return true;
    } else {
      console.log(`❌ Insufficient treasury balance!`);
      console.log(
        `   Need: ${(Number(requiredBalance) / 1e18).toFixed(6)} ETH`
      );
      console.log(
        `   Have: ${(Number(treasuryBalance) / 1e18).toFixed(6)} ETH`
      );
      console.log(
        `   Shortfall: ${(
          Number(requiredBalance - treasuryBalance) / 1e18
        ).toFixed(6)} ETH`
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check treasury balance:', error);
    return false;
  }
}

async function createGames(numberOfGames: number) {
  try {
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }

    // Create account from private key
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    // Create clients
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    console.log(`🎮 Starting to create ${numberOfGames} games...`);
    console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`👤 Account: ${account.address}`);
    console.log('');

    // Check treasury balance before starting
    const entryFee = parseEther('0.0001');
    const hasEnoughBalance = await checkTreasuryBalance(publicClient, entryFee);

    if (!hasEnoughBalance) {
      console.log(
        '💰 Treasury needs funding - attempting to fund automatically...'
      );

      // Calculate how much we need to fund (with some buffer)
      const requiredBalance = entryFee * BigInt(10); // 10x multiplier
      const fundingAmount = requiredBalance + parseEther('0.001'); // Add 0.001 ETH buffer

      const fundingSuccess = await fundTreasury(
        walletClient,
        publicClient,
        fundingAmount
      );

      if (!fundingSuccess) {
        console.log('❌ Failed to fund treasury automatically');
        console.log(
          '💡 Please fund the treasury manually or reduce the entry fee'
        );
        process.exit(1);
      }

      // Re-check balance after funding
      console.log('🔍 Re-checking treasury balance after funding...');
      const hasEnoughBalanceAfterFunding = await checkTreasuryBalance(
        publicClient,
        entryFee
      );

      if (!hasEnoughBalanceAfterFunding) {
        console.log('❌ Still insufficient balance after funding');
        process.exit(1);
      }
    }

    console.log('');

    const createdGameIds: number[] = [];

    for (let i = 0; i < numberOfGames; i++) {
      try {
        // Get a random combination (cycle through if we need more games than combinations)
        const combination = GAME_COMBINATIONS[i % GAME_COMBINATIONS.length];

        // Hash the middle word
        const middleWordHash = hashWord(combination.middleWord);

        // Use the same entry fee as checked above
        const gameEntryFee = entryFee;

        console.log(`🎯 Creating game ${i + 1}/${numberOfGames}...`);
        console.log(`   Top: "${combination.topWord}"`);
        console.log(
          `   Middle: "${combination.middleWord}" (${combination.middleWordLength} chars)`
        );
        console.log(`   Bottom: "${combination.bottomWord}"`);
        console.log(`   Entry Fee: ${gameEntryFee} wei`);

        // Call createGame function
        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'createGame',
          args: [
            combination.topWord,
            middleWordHash,
            BigInt(combination.middleWordLength),
            combination.bottomWord,
            gameEntryFee,
          ],
        });

        console.log(`   📝 Transaction hash: ${hash}`);

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
          // Extract game ID from logs
          const gameCreatedLog = receipt.logs.find(
            log => log.topics[0] === '0x...' // GameCreated event signature
          );

          if (gameCreatedLog && gameCreatedLog.topics[1]) {
            const gameId = parseInt(gameCreatedLog.topics[1], 16);
            createdGameIds.push(gameId);
            console.log(`   ✅ Game created successfully! Game ID: ${gameId}`);
          } else {
            console.log(
              `   ✅ Game created successfully! (Game ID not extracted from logs)`
            );
          }
        } else {
          console.log(`   ❌ Transaction failed`);
        }

        console.log('');

        // Add a small delay between transactions to avoid rate limiting
        if (i < numberOfGames - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      } catch (error) {
        console.error(`   ❌ Failed to create game ${i + 1}:`, error);
        console.log('');
      }
    }

    console.log('🎉 Game creation completed!');
    console.log(`📊 Successfully created ${createdGameIds.length} games`);
    if (createdGameIds.length > 0) {
      console.log(`🎮 Game IDs: ${createdGameIds.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Get number of games from command line argument
const numberOfGames = process.argv[2] ? parseInt(process.argv[2]) : 5;

if (isNaN(numberOfGames) || numberOfGames <= 0) {
  console.error('❌ Please provide a valid number of games to create');
  console.log(
    'Usage: npx tsx scripts/create-games-standalone.ts <number_of_games>'
  );
  console.log('Example: npx tsx scripts/create-games-standalone.ts 10');
  process.exit(1);
}

console.log(`🚀 Creating ${numberOfGames} games...`);
createGames(numberOfGames);
