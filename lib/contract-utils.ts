import { ethers } from 'ethers';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export interface ContractConfig {
  address: string;
  abi: any[];
  network: string;
}

// Contract ABI (simplified for MVP)
export const GUESS_WHAT_GAME_ABI = [
  'function createGame(string memory _topWord, string memory _middleWord, string memory _bottomWord, uint256 _entryFee) external returns (uint256)',
  'function joinGame(uint256 _gameId) external payable',
  'function submitGuess(uint256 _gameId, string memory _guess) external',
  'function getGameInfo(uint256 _gameId) external view returns (uint256, string memory, string memory, string memory, uint256, uint256, uint256, uint256, bool, bool, address)',
  'function getPlayerStats(address _player) external view returns (uint256, uint256, uint256, uint256)',
  'function isPlayerInGame(uint256 _gameId, address _player) external view returns (bool)',
  'function hasPlayerGuessed(uint256 _gameId, address _player) external view returns (bool)',
  'function getPlayerGuess(uint256 _gameId, address _player) external view returns (string memory)',
  'event GameCreated(uint256 indexed gameId, uint256 entryFee, uint256 timeLimit)',
  'event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 entryFee)',
  'event GuessSubmitted(uint256 indexed gameId, address indexed player, string guess)',
  'event GameWon(uint256 indexed gameId, address indexed winner, uint256 prize)',
  'event GameExpired(uint256 indexed gameId, uint256 totalPrize)',
];

// Base network configuration
export const BASE_CONFIG = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
};

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  base: '0x0000000000000000000000000000000000000000', // Update after deployment
  baseSepolia: '0x0000000000000000000000000000000000000000', // Update after deployment
};

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const network = await this.provider.getNetwork();
      const contractAddress = this.getContractAddress(network.chainId);

      if (contractAddress) {
        this.contract = new ethers.Contract(
          contractAddress,
          GUESS_WHAT_GAME_ABI,
          this.signer
        );
      }
    }
  }

  private getContractAddress(chainId: bigint): string | null {
    const chainIdNumber = Number(chainId);
    if (chainIdNumber === 8453) return CONTRACT_ADDRESSES.base;
    if (chainIdNumber === 84532) return CONTRACT_ADDRESSES.baseSepolia;
    return null;
  }

  async createGame(
    topWord: string,
    middleWord: string,
    bottomWord: string,
    entryFee: string
  ): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');

    const tx = await this.contract.createGame(
      topWord,
      middleWord,
      bottomWord,
      ethers.parseEther(entryFee)
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract!.interface.parseLog(log);
        return parsed?.name === 'GameCreated';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = this.contract!.interface.parseLog(event);
      return Number(parsed!.args.gameId);
    }

    throw new Error('Game creation failed');
  }

  async joinGame(gameId: number, entryFee: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');

    const tx = await this.contract.joinGame(gameId, {
      value: ethers.parseEther(entryFee),
    });
    await tx.wait();
  }

  async submitGuess(gameId: number, guess: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');

    const tx = await this.contract.submitGuess(gameId, guess);
    await tx.wait();
  }

  async getGameInfo(gameId: number) {
    if (!this.contract) throw new Error('Contract not initialized');

    const info = await this.contract.getGameInfo(gameId);
    return {
      gameId: Number(info[0]),
      topWord: info[1],
      middleWord: info[2],
      bottomWord: info[3],
      entryFee: ethers.formatEther(info[4]),
      totalPrize: ethers.formatEther(info[5]),
      timeLimit: Number(info[6]),
      startTime: Number(info[7]),
      isActive: info[8],
      isCompleted: info[9],
      winner: info[10],
    };
  }

  async getPlayerStats(playerAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');

    const stats = await this.contract.getPlayerStats(playerAddress);
    return {
      gamesPlayed: Number(stats[0]),
      correctGuesses: Number(stats[1]),
      totalWinnings: ethers.formatEther(stats[2]),
      accuracy: Number(stats[3]) / 100, // Convert from basis points
    };
  }

  async isPlayerInGame(
    gameId: number,
    playerAddress: string
  ): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.isPlayerInGame(gameId, playerAddress);
  }

  async hasPlayerGuessed(
    gameId: number,
    playerAddress: string
  ): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasPlayerGuessed(gameId, playerAddress);
  }

  async getPlayerGuess(gameId: number, playerAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getPlayerGuess(gameId, playerAddress);
  }

  async switchToBaseNetwork(): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }
}

// Singleton instance
export const contractService = new ContractService();
