import { GameWord, GameState } from './game-types';

// Word database organized by categories
export const WORD_DATABASE: Record<string, GameWord[]> = {
  animals: [
    { word: 'cat', category: 'animals', difficulty: 'easy' },
    { word: 'dog', category: 'animals', difficulty: 'easy' },
    { word: 'elephant', category: 'animals', difficulty: 'medium' },
    { word: 'butterfly', category: 'animals', difficulty: 'medium' },
    { word: 'rhinoceros', category: 'animals', difficulty: 'hard' },
    { word: 'hippopotamus', category: 'animals', difficulty: 'hard' },
  ],
  food: [
    { word: 'pizza', category: 'food', difficulty: 'easy' },
    { word: 'burger', category: 'food', difficulty: 'easy' },
    { word: 'spaghetti', category: 'food', difficulty: 'medium' },
    { word: 'sandwich', category: 'food', difficulty: 'medium' },
    { word: 'cappuccino', category: 'food', difficulty: 'hard' },
    { word: 'quinoa', category: 'food', difficulty: 'hard' },
  ],
  colors: [
    { word: 'red', category: 'colors', difficulty: 'easy' },
    { word: 'blue', category: 'colors', difficulty: 'easy' },
    { word: 'purple', category: 'colors', difficulty: 'medium' },
    { word: 'orange', category: 'colors', difficulty: 'medium' },
    { word: 'turquoise', category: 'colors', difficulty: 'hard' },
    { word: 'magenta', category: 'colors', difficulty: 'hard' },
  ],
  sports: [
    { word: 'soccer', category: 'sports', difficulty: 'easy' },
    { word: 'tennis', category: 'sports', difficulty: 'easy' },
    { word: 'basketball', category: 'sports', difficulty: 'medium' },
    { word: 'volleyball', category: 'sports', difficulty: 'medium' },
    { word: 'badminton', category: 'sports', difficulty: 'hard' },
    { word: 'gymnastics', category: 'sports', difficulty: 'hard' },
  ],
  technology: [
    { word: 'phone', category: 'technology', difficulty: 'easy' },
    { word: 'laptop', category: 'technology', difficulty: 'easy' },
    { word: 'keyboard', category: 'technology', difficulty: 'medium' },
    { word: 'monitor', category: 'technology', difficulty: 'medium' },
    { word: 'microprocessor', category: 'technology', difficulty: 'hard' },
    { word: 'cryptocurrency', category: 'technology', difficulty: 'hard' },
  ],
};

export function generateGameWords(category?: string): {
  top: string;
  middle: string;
  bottom: string;
} {
  const categories = category ? [category] : Object.keys(WORD_DATABASE);
  const selectedCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_DATABASE[selectedCategory];

  // Select 3 words from the same category
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, 3);

  // Shuffle the order
  const shuffledOrder = selectedWords.sort(() => Math.random() - 0.5);

  return {
    top: shuffledOrder[0].word,
    middle: shuffledOrder[1].word,
    bottom: shuffledOrder[2].word,
  };
}

export function createWordHint(word: string): string {
  if (word.length <= 2) {
    return word; // Show full word if too short
  }

  const firstLetter = word[0];
  const lastLetter = word[word.length - 1];
  const middleLength = word.length - 2;
  const dots = '•'.repeat(middleLength);

  return `${firstLetter}${dots}${lastLetter}`;
}

export function calculateTimeBonus(
  timeElapsed: number,
  timeLimit: number
): number {
  const timeRemaining = Math.max(0, timeLimit - timeElapsed);
  const bonusMultiplier = timeRemaining / timeLimit;
  return Math.floor(bonusMultiplier * 100); // 0-100 bonus points
}

export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createNewGame(entryFee: number = 0.001): GameState {
  const words = generateGameWords();
  const gameId = generateGameId();

  return {
    id: gameId,
    words,
    middleWordHint: createWordHint(words.middle),
    playerGuess: '',
    isCorrect: null,
    timeStarted: Date.now(),
    timeLimit: 30, // 30 seconds
    entryFee,
    totalPrize: entryFee,
    isActive: true,
    isCompleted: false,
  };
}

export function getTimeRemaining(gameState: GameState): number {
  const elapsed = (Date.now() - gameState.timeStarted) / 1000;
  return Math.max(0, gameState.timeLimit - elapsed);
}

export function isGameExpired(gameState: GameState): boolean {
  return getTimeRemaining(gameState) <= 0;
}
