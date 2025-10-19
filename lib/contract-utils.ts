import { createPublicClient, http, parseEther, formatEther, decodeEventLog, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { getWalletClient } from 'wagmi/actions';
import { config } from '@/contexts/miniapp-wallet-context';

export interface ContractConfig {
  address: string;
  abi: any[];
  network: string;
}

// Contract ABI (viem format)
export const GUESS_WHAT_GAME_ABI = [
  {
    name: 'createGame',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_topWord', type: 'string' },
      { name: '_middleWord', type: 'string' },
      { name: '_bottomWord', type: 'string' },
      { name: '_entryFee', type: 'uint256' },
      { name: '_initialPrizePool', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'joinGame',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_gameId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'submitGuess',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_gameId', type: 'uint256' },
      { name: '_guess', type: 'string' }
    ],
    outputs: []
  },
  {
    name: 'getGameInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_gameId', type: 'uint256' }],
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'string' },
      { name: '', type: 'string' },
      { name: '', type: 'string' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'bool' },
      { name: '', type: 'bool' },
      { name: '', type: 'address' }
    ]
  },
  {
    name: 'getPlayerStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_player', type: 'address' }],
    outputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' }
    ]
  },
  {
    name: 'isPlayerInGame',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_gameId', type: 'uint256' },
      { name: '_player', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'hasPlayerGuessed',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_gameId', type: 'uint256' },
      { name: '_player', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getPlayerGuess',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_gameId', type: 'uint256' },
      { name: '_player', type: 'address' }
    ],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'getRandomActiveGame',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getActiveGamesCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'nextGameId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'isOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_address', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'isAdmin',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_address', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'addAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_admin', type: 'address' }],
    outputs: []
  },
  {
    name: 'removeAdmin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_admin', type: 'address' }],
    outputs: []
  },
  {
    name: 'getAdminList',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }]
  },
  {
    name: 'getAdminCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'GameCreated',
    type: 'event',
    inputs: [
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'entryFee', type: 'uint256', indexed: false },
      { name: 'timeLimit', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'PlayerJoined',
    type: 'event',
    inputs: [
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'player', type: 'address', indexed: true },
      { name: 'entryFee', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'GuessSubmitted',
    type: 'event',
    inputs: [
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'player', type: 'address', indexed: true },
      { name: 'guess', type: 'string', indexed: false }
    ]
  },
  {
    name: 'GameWon',
    type: 'event',
    inputs: [
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'prize', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'GameExpired',
    type: 'event',
    inputs: [
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'totalPrize', type: 'uint256', indexed: false }
    ]
  }
] as const;

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  [base.id]: '0x0000000000000000000000000000000000000000', // Update after mainnet deployment
  [baseSepolia.id]: '0xD12F1b4C8679626E5D95a7216381aa506C290758', // Updated contract with removed fee limits
} as const;

export class ContractService {
  private publicClient: any = null;
  private contractAddress: Address | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    if (typeof window !== 'undefined') {
      // Create public client for read operations
      this.publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });

      // Set contract address based on current chain
      this.contractAddress = CONTRACT_ADDRESSES[baseSepolia.id] as Address;
    }
  }

  private async getWalletClient() {
    const walletClient = await getWalletClient(config);
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    return walletClient;
  }

  private getContractAddress(chainId: number): Address | null {
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as Address || null;
  }

  async createGame(
    topWord: string,
    middleWord: string,
    bottomWord: string,
    entryFee: string,
    initialPrizePool: string
  ): Promise<number> {
    console.log('🏗️ Creating contract game...');
    console.log('📝 Words:', { topWord, middleWord, bottomWord });
    console.log('💰 Entry fee:', entryFee);
    console.log('🏆 Initial prize pool:', initialPrizePool);
    console.log('📍 Contract address:', this.contractAddress);
    
    if (!this.contractAddress) {
      const error = 'Contract address not initialized';
      console.error('❌', error);
      throw new Error(error);
    }

    const walletClient = await this.getWalletClient();
    console.log('👛 Wallet client obtained');
    console.log('Wallet client object:', walletClient);
    
    try {
      console.log('📤 Sending createGame transaction...');
      
      // Parse ETH values with high precision
      const entryFeeWei = parseEther(entryFee);
      const prizePoolWei = parseEther(initialPrizePool);
      
      
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'createGame',
        args: [topWord, middleWord, bottomWord, entryFeeWei, prizePoolWei],
        value: prizePoolWei, // Send ETH for the prize pool
      });
      console.log('📋 Transaction hash:', hash);

      // Wait for transaction to be mined
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Transaction confirmed:', receipt);
      
      // Parse the event to get the game ID
      console.log('🔍 Looking for GameCreated event...');
      const event = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: GUESS_WHAT_GAME_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === 'GameCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const decoded = decodeEventLog({
          abi: GUESS_WHAT_GAME_ABI,
          data: event.data,
          topics: event.topics,
        });
        const gameId = Number((decoded.args as any).gameId);
        console.log('🎮 Game created with ID:', gameId);
        return gameId;
      }

      const error = 'Game creation event not found';
      console.error('❌', error);
      throw new Error(error);
    } catch (error: any) {
      console.error('❌ Contract game creation failed:', error);
      throw new Error(`Failed to create game: ${error.message}`);
    }
  }

  async joinGame(gameId: number, entryFee: string): Promise<void> {
    console.log('🎯 Joining contract game...');
    console.log('🆔 Game ID:', gameId);
    console.log('💰 Entry fee:', entryFee);
    console.log('📍 Contract address:', this.contractAddress);
    
    if (!this.contractAddress) {
      const error = 'Contract address not initialized';
      console.error('❌', error);
      throw new Error(error);
    }

    const walletClient = await this.getWalletClient();
    console.log('👛 Wallet client obtained');
    
    try {
      console.log('📤 Sending joinGame transaction...');
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'joinGame',
        args: [BigInt(gameId)],
        value: parseEther(entryFee),
      });
      console.log('📋 Transaction hash:', hash);

      // Wait for transaction to be mined
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Transaction confirmed:', receipt);
      console.log('🎉 Successfully joined game!');
    } catch (error: any) {
      console.error('❌ Failed to join game:', error);
      throw new Error(`Failed to join game: ${error.message}`);
    }
  }

  async submitGuess(gameId: number, guess: string): Promise<void> {
    console.log('🎯 Submitting guess to contract...');
    console.log('🆔 Game ID:', gameId);
    console.log('💭 Guess:', guess);
    console.log('📍 Contract address:', this.contractAddress);
    
    if (!this.contractAddress) {
      const error = 'Contract address not initialized';
      console.error('❌', error);
      throw new Error(error);
    }

    const walletClient = await this.getWalletClient();
    console.log('👛 Wallet client obtained');
    
    try {
      console.log('📤 Sending submitGuess transaction...');
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'submitGuess',
        args: [BigInt(gameId), guess],
      });
      console.log('📋 Transaction hash:', hash);

      // Wait for transaction to be mined
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Transaction confirmed:', receipt);
      console.log('🎉 Guess submitted successfully!');
    } catch (error: any) {
      console.error('❌ Failed to submit guess:', error);
      throw new Error(`Failed to submit guess: ${error.message}`);
    }
  }

  async getGameInfo(gameId: number) {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    const info = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getGameInfo',
      args: [BigInt(gameId)]
    });

    return {
      gameId: Number(info[0]),
      topWord: info[1],
      middleWord: info[2],
      bottomWord: info[3],
      entryFee: formatEther(info[4]),
      totalPrize: formatEther(info[5]),
      initialPrizePool: formatEther(info[6]),
      timeLimit: Number(info[7]),
      startTime: Number(info[8]),
      isActive: info[9],
      isCompleted: info[10],
      winner: info[11],
    };
  }

  async getPlayerStats(playerAddress: string) {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    const stats = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getPlayerStats',
      args: [playerAddress as Address]
    });

    return {
      gamesPlayed: Number(stats[0]),
      correctGuesses: Number(stats[1]),
      totalWinnings: formatEther(stats[2]),
      accuracy: Number(stats[3]) / 100, // Convert from basis points
    };
  }

  async isPlayerInGame(
    gameId: number,
    playerAddress: string
  ): Promise<boolean> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }
    
    return await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'isPlayerInGame',
      args: [BigInt(gameId), playerAddress as Address]
    });
  }

  async hasPlayerGuessed(
    gameId: number,
    playerAddress: string
  ): Promise<boolean> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }
    
    return await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'hasPlayerGuessed',
      args: [BigInt(gameId), playerAddress as Address]
    });
  }

  async getPlayerGuess(gameId: number, playerAddress: string): Promise<string> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }
    
    return await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getPlayerGuess',
      args: [BigInt(gameId), playerAddress as Address]
    });
  }

  async switchToBaseNetwork(): Promise<void> {
    const walletClient = await this.getWalletClient();
    
    try {
      await walletClient.switchChain({ id: baseSepolia.id });
    } catch (error: any) {
      throw new Error(`Failed to switch to Base Sepolia network: ${error.message}`);
    }
  }

  // Get the next game ID to check if there are any games available
  async getNextGameId(): Promise<number> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('🔍 Getting next game ID...');
    const nextGameId = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'nextGameId'
    });

    console.log('📊 Next game ID:', Number(nextGameId));
    return Number(nextGameId);
  }

  // Check if a game exists and is active
  async isGameAvailable(gameId: number): Promise<boolean> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    try {
      console.log(`🔍 Checking if game ${gameId} is available...`);
      const gameInfo = await this.getGameInfo(gameId);
      const isAvailable = gameInfo.isActive && !gameInfo.isCompleted;
      console.log(`📊 Game ${gameId} available:`, isAvailable);
      return isAvailable;
    } catch (error) {
      console.log(`❌ Game ${gameId} not available:`, error);
      return false;
    }
  }

  // Get a random active game
  async getRandomActiveGame(): Promise<number> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('🎲 Getting random active game...');
    const gameId = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getRandomActiveGame'
    });

    console.log('🎮 Random game ID:', Number(gameId));
    return Number(gameId);
  }

  // Get count of active games
  async getActiveGamesCount(): Promise<number> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('📊 Getting active games count...');
    const count = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getActiveGamesCount'
    });

    console.log('📈 Active games count:', Number(count));
    return Number(count);
  }

  // Check if an address is the contract owner
  async isOwner(address: string): Promise<boolean> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('👑 Checking if address is owner...', address);
    const isOwner = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'isOwner',
      args: [address as Address]
    });

    console.log('👑 Is owner:', isOwner);
    return isOwner;
  }

  // Get the contract owner address
  async getOwner(): Promise<string> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('👑 Getting contract owner...');
    const owner = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'owner'
    });

    console.log('👑 Contract owner:', owner);
    return owner as string;
  }

  // Check if an address is an admin
  async isAdmin(address: string): Promise<boolean> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('👑 Checking if address is admin...', address);
    const isAdmin = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'isAdmin',
      args: [address as Address]
    });

    console.log('👑 Is admin:', isAdmin);
    return isAdmin;
  }

  // Add an admin (only owner can call)
  async addAdmin(adminAddress: string): Promise<void> {
    if (!this.contractAddress) {
      throw new Error('Contract address not initialized');
    }

    const walletClient = await this.getWalletClient();
    console.log('👑 Adding admin...', adminAddress);
    
    const hash = await walletClient.writeContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'addAdmin',
      args: [adminAddress as Address]
    });

    console.log('📋 Transaction hash:', hash);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Admin added successfully:', receipt);
  }

  // Remove an admin (only owner can call)
  async removeAdmin(adminAddress: string): Promise<void> {
    if (!this.contractAddress) {
      throw new Error('Contract address not initialized');
    }

    const walletClient = await this.getWalletClient();
    console.log('👑 Removing admin...', adminAddress);
    
    const hash = await walletClient.writeContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'removeAdmin',
      args: [adminAddress as Address]
    });

    console.log('📋 Transaction hash:', hash);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Admin removed successfully:', receipt);
  }

  // Get list of admins
  async getAdminList(): Promise<string[]> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('👑 Getting admin list...');
    const adminList = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getAdminList'
    });

    console.log('👑 Admin list:', adminList);
    return adminList as string[];
  }

  // Get admin count
  async getAdminCount(): Promise<number> {
    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Public client or contract address not initialized');
    }

    console.log('👑 Getting admin count...');
    const count = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: GUESS_WHAT_GAME_ABI,
      functionName: 'getAdminCount'
    });

    console.log('👑 Admin count:', Number(count));
    return Number(count);
  }
}

// Singleton instance
export const contractService = new ContractService();