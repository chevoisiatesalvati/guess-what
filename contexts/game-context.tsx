'use client';

import { GameState, GameResult, PlayerStats } from '@/lib/game-types';
import { createNewGame, getTimeRemaining } from '@/lib/game-utils';
import { validateGuess } from '@/lib/utils';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface GameContextType {
  currentGame: GameState | null;
  playerStats: PlayerStats;
  isPlaying: boolean;
  timeRemaining: number;
  startNewGame: (entryFee?: number) => void;
  submitGuess: (guess: string) => GameResult;
  endGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    gamesPlayed: 0,
    correctGuesses: 0,
    totalWinnings: 0,
    accuracy: 0,
    averageTime: 0,
  });

  // Timer effect
  useEffect(() => {
    if (!currentGame || !isPlaying) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(currentGame);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        endGame();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentGame, isPlaying]);

  const startNewGame = useCallback((entryFee: number = 0.001) => {
    const newGame = createNewGame(entryFee);
    setCurrentGame(newGame);
    setIsPlaying(true);
    setTimeRemaining(newGame.timeLimit);
  }, []);

  const submitGuess = useCallback(
    (guess: string): GameResult => {
      if (!currentGame || !isPlaying) {
        return { success: false, message: 'No active game' };
      }

      const isCorrect = validateGuess(guess, currentGame.words.middle);
      const timeElapsed = (Date.now() - currentGame.timeStarted) / 1000;

      setCurrentGame(prev =>
        prev
          ? {
              ...prev,
              playerGuess: guess,
              isCorrect,
            }
          : null
      );

      if (isCorrect) {
        // Player won!
        const bonus = Math.floor(
          ((currentGame.timeLimit - timeElapsed) / currentGame.timeLimit) * 100
        );
        const totalPrize = currentGame.totalPrize + bonus;

        setPlayerStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          correctGuesses: prev.correctGuesses + 1,
          totalWinnings: prev.totalWinnings + totalPrize,
          accuracy: ((prev.correctGuesses + 1) / (prev.gamesPlayed + 1)) * 100,
          averageTime:
            (prev.averageTime * prev.gamesPlayed + timeElapsed) /
            (prev.gamesPlayed + 1),
        }));

        setIsPlaying(false);

        return {
          success: true,
          message: `Correct! You won ${totalPrize} ETH!`,
          prize: totalPrize,
        };
      } else {
        // Player lost, add entry fee to total prize
        const newTotalPrize = currentGame.totalPrize + currentGame.entryFee;

        setCurrentGame(prev =>
          prev
            ? {
                ...prev,
                totalPrize: newTotalPrize,
              }
            : null
        );

        setPlayerStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          accuracy: (prev.correctGuesses / (prev.gamesPlayed + 1)) * 100,
        }));

        return {
          success: false,
          message: 'Incorrect guess. Try again!',
          newTotalPrize,
        };
      }
    },
    [currentGame, isPlaying]
  );

  const endGame = useCallback(() => {
    if (currentGame) {
      setCurrentGame(prev =>
        prev
          ? {
              ...prev,
              isActive: false,
              isCompleted: true,
            }
          : null
      );
    }
    setIsPlaying(false);
  }, [currentGame]);

  const resetGame = useCallback(() => {
    setCurrentGame(null);
    setIsPlaying(false);
    setTimeRemaining(0);
  }, []);

  const value: GameContextType = {
    currentGame,
    playerStats,
    isPlaying,
    timeRemaining,
    startNewGame,
    submitGuess,
    endGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
