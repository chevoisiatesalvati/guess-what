import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '@/lib/contract-utils';

export interface ContractGameInfo {
  gameId: number;
  topWord: string;
  middleWordLength: number; // Changed from middleWord
  bottomWord: string;
  entryFee: string;
  totalPrize: string;
  basePrizeAmount: string; // Changed from initialPrizePool
  startTime: number;
  isActive: boolean;
  isCompleted: boolean;
  winner: string;
}

export interface ContractPlayerStats {
  gamesPlayed: number;
  guessesPlayed: number;
  correctGuesses: number;
  totalWinnings: string;
  accuracy: number;
}

export const useContract = () => {
  const { address } = useAccount();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(!!address);
  }, [address]);

  const createGame = useCallback(
    async (
      topWord: string,
      middleWordHash: `0x${string}`,
      bottomWord: string,
      entryFee: string
    ): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const gameId = await contractService.createGame(
          topWord,
          middleWordHash,
          bottomWord,
          entryFee
        );
        return gameId;
      } catch (err: any) {
        setError(err.message || 'Failed to create game');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // joinGame() removed - players auto-join on first submitGuess() for better UX

  const submitGuess = useCallback(
    async (gameId: number, guess: string, entryFee: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.submitGuess(gameId, guess, entryFee);
      } catch (err: any) {
        setError(err.message || 'Failed to submit guess');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getGameInfo = useCallback(
    async (gameId: number): Promise<ContractGameInfo> => {
      try {
        return await contractService.getGameInfo(gameId);
      } catch (err: any) {
        setError(err.message || 'Failed to get game info');
        throw err;
      }
    },
    []
  );

  const getPlayerStats =
    useCallback(async (): Promise<ContractPlayerStats | null> => {
      if (!address) return null;

      try {
        return await contractService.getPlayerStats(address);
      } catch (err: any) {
        setError(err.message || 'Failed to get player stats');
        return null;
      }
    }, [address]);

  const isPlayerInGame = useCallback(
    async (gameId: number): Promise<boolean> => {
      if (!address) return false;

      try {
        return await contractService.isPlayerInGame(gameId, address);
      } catch (err: any) {
        setError(err.message || 'Failed to check player status');
        return false;
      }
    },
    [address]
  );

  const hasPlayerGuessed = useCallback(
    async (gameId: number): Promise<boolean> => {
      if (!address) return false;

      try {
        return await contractService.hasPlayerGuessed(gameId, address);
      } catch (err: any) {
        setError(err.message || 'Failed to check guess status');
        return false;
      }
    },
    [address]
  );

  const getNextGameId = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getNextGameId();
    } catch (err: any) {
      setError(err.message || 'Failed to get next game ID');
      throw err;
    }
  }, []);

  const isGameAvailable = useCallback(
    async (gameId: number): Promise<boolean> => {
      try {
        return await contractService.isGameAvailable(gameId);
      } catch (err: any) {
        setError(err.message || 'Failed to check game availability');
        return false;
      }
    },
    []
  );

  const getRandomActiveGame = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getRandomActiveGame();
    } catch (err: any) {
      setError(err.message || 'Failed to get random game');
      throw err;
    }
  }, []);

  const getActiveGamesCount = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getActiveGamesCount();
    } catch (err: any) {
      setError(err.message || 'Failed to get active games count');
      return 0;
    }
  }, []);

  const isOwner = useCallback(async (address: string): Promise<boolean> => {
    try {
      return await contractService.isOwner(address);
    } catch (err: any) {
      setError(err.message || 'Failed to check ownership');
      return false;
    }
  }, []);

  const getOwner = useCallback(async (): Promise<string> => {
    try {
      return await contractService.getOwner();
    } catch (err: any) {
      setError(err.message || 'Failed to get owner');
      throw err;
    }
  }, []);

  const isAdmin = useCallback(async (address: string): Promise<boolean> => {
    try {
      return await contractService.isAdmin(address);
    } catch (err: any) {
      setError(err.message || 'Failed to check admin status');
      return false;
    }
  }, []);

  const addAdmin = useCallback(async (adminAddress: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await contractService.addAdmin(adminAddress);
    } catch (err: any) {
      setError(err.message || 'Failed to add admin');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeAdmin = useCallback(
    async (adminAddress: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.removeAdmin(adminAddress);
      } catch (err: any) {
        setError(err.message || 'Failed to remove admin');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getAdminList = useCallback(async (): Promise<string[]> => {
    try {
      return await contractService.getAdminList();
    } catch (err: any) {
      setError(err.message || 'Failed to get admin list');
      return [];
    }
  }, []);

  const getAdminCount = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getAdminCount();
    } catch (err: any) {
      setError(err.message || 'Failed to get admin count');
      return 0;
    }
  }, []);

  // Treasury management functions
  const fundTreasury = useCallback(async (amount: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await contractService.fundTreasury(amount);
    } catch (err: any) {
      setError(err.message || 'Failed to fund treasury');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTreasuryBalance = useCallback(async (): Promise<string> => {
    try {
      return await contractService.getTreasuryBalance();
    } catch (err: any) {
      setError(err.message || 'Failed to get treasury balance');
      return '0';
    }
  }, []);

  const withdrawFromTreasury = useCallback(
    async (amount: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.withdrawFromTreasury(amount);
      } catch (err: any) {
        setError(err.message || 'Failed to withdraw from treasury');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPrizeMultiplier = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getPrizeMultiplier();
    } catch (err: any) {
      setError(err.message || 'Failed to get prize multiplier');
      return 10; // default
    }
  }, []);

  const setPrizeMultiplier = useCallback(
    async (multiplier: number): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.setPrizeMultiplier(multiplier);
      } catch (err: any) {
        setError(err.message || 'Failed to set prize multiplier');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPlatformFee = useCallback(async (): Promise<number> => {
    try {
      return await contractService.getPlatformFee();
    } catch (err: any) {
      setError(err.message || 'Failed to get platform fee');
      return 10; // default
    }
  }, []);

  const setPlatformFee = useCallback(
    async (feePercent: number): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.setPlatformFee(feePercent);
      } catch (err: any) {
        setError(err.message || 'Failed to set platform fee');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isConnected,
    isLoading,
    error,
    createGame,
    submitGuess,
    getGameInfo,
    getPlayerStats,
    isPlayerInGame,
    hasPlayerGuessed,
    getNextGameId,
    isGameAvailable,
    getRandomActiveGame,
    getActiveGamesCount,
    isOwner,
    getOwner,
    isAdmin,
    addAdmin,
    removeAdmin,
    getAdminList,
    getAdminCount,
    fundTreasury,
    getTreasuryBalance,
    withdrawFromTreasury,
    getPrizeMultiplier,
    setPrizeMultiplier,
    getPlatformFee,
    setPlatformFee,
  };
};
