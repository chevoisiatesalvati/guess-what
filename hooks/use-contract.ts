import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '@/lib/contract-utils';

export interface ContractGameInfo {
  gameId: number;
  topWord: string;
  middleWord: string;
  bottomWord: string;
  entryFee: string;
  totalPrize: string;
  timeLimit: number;
  startTime: number;
  isActive: boolean;
  isCompleted: boolean;
  winner: string;
}

export interface ContractPlayerStats {
  gamesPlayed: number;
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
      middleWord: string,
      bottomWord: string,
      entryFee: string
    ): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const gameId = await contractService.createGame(
          topWord,
          middleWord,
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

  const joinGame = useCallback(
    async (gameId: number, entryFee: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.joinGame(gameId, entryFee);
      } catch (err: any) {
        setError(err.message || 'Failed to join game');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const submitGuess = useCallback(
    async (gameId: number, guess: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await contractService.submitGuess(gameId, guess);
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

  const switchToBaseNetwork = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await contractService.switchToBaseNetwork();
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    createGame,
    joinGame,
    submitGuess,
    getGameInfo,
    getPlayerStats,
    isPlayerInGame,
    hasPlayerGuessed,
    switchToBaseNetwork,
  };
};
