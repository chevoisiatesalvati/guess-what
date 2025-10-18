export interface GameWord {
  word: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  id: string;
  words: {
    top: string;
    middle: string;
    bottom: string;
  };
  middleWordHint: string; // First and last letter
  playerGuess: string;
  isCorrect: boolean | null;
  timeStarted: number;
  timeLimit: number; // in seconds
  entryFee: number; // in wei
  totalPrize: number; // in wei
  isActive: boolean;
  isCompleted: boolean;
  winner?: string; // player address
}

export interface PlayerStats {
  gamesPlayed: number;
  correctGuesses: number;
  totalWinnings: number;
  accuracy: number;
  averageTime: number;
}

export interface GameResult {
  success: boolean;
  message: string;
  prize?: number;
  newTotalPrize?: number;
}
