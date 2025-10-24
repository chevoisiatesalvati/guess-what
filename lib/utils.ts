import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { keccak256, toBytes } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Game-related utility functions
export function hashWord(word: string): `0x${string}` {
  // Normalize the word: lowercase and trim
  const normalized = word.toLowerCase().trim();
  return keccak256(toBytes(normalized));
}

export function validateGuess(guess: string, correctWord: string): boolean {
  return guess.toLowerCase().trim() === correctWord.toLowerCase().trim();
}

export function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}
