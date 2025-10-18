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
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_topWord', type: 'string' },
      { name: '_middleWord', type: 'string' },
      { name: '_bottomWord', type: 'string' },
      { name: '_entryFee', type: 'uint256' }
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
  [baseSepolia.id]: '0x0F93b47fFd12B2af62Eacd26bB92fD75af297E37', // Deployed to Base Sepolia
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
    entryFee: string
  ): Promise<number> {
    if (!this.contractAddress) {
      throw new Error('Contract address not initialized');
    }

    const walletClient = await this.getWalletClient();
    
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'createGame',
        args: [topWord, middleWord, bottomWord, parseEther(entryFee)],
      });

      // Wait for transaction to be mined
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      // Parse the event to get the game ID
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
        return Number((decoded.args as any).gameId);
      }

      throw new Error('Game creation event not found');
    } catch (error: any) {
      throw new Error(`Failed to create game: ${error.message}`);
    }
  }

  async joinGame(gameId: number, entryFee: string): Promise<void> {
    if (!this.contractAddress) {
      throw new Error('Contract address not initialized');
    }

    const walletClient = await this.getWalletClient();
    
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'joinGame',
        args: [BigInt(gameId)],
        value: parseEther(entryFee),
      });

      // Wait for transaction to be mined
      await this.publicClient.waitForTransactionReceipt({ hash });
    } catch (error: any) {
      throw new Error(`Failed to join game: ${error.message}`);
    }
  }

  async submitGuess(gameId: number, guess: string): Promise<void> {
    if (!this.contractAddress) {
      throw new Error('Contract address not initialized');
    }

    const walletClient = await this.getWalletClient();
    
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: GUESS_WHAT_GAME_ABI,
        functionName: 'submitGuess',
        args: [BigInt(gameId), guess],
      });

      // Wait for transaction to be mined
      await this.publicClient.waitForTransactionReceipt({ hash });
    } catch (error: any) {
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
      timeLimit: Number(info[6]),
      startTime: Number(info[7]),
      isActive: info[8],
      isCompleted: info[9],
      winner: info[10],
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
}

// Singleton instance
export const contractService = new ContractService();