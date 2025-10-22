'use client';

import { useContract } from '@/hooks/use-contract';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Game() {
  const router = useRouter();
  const { address } = useAccount();
  const {
    isConnected,
    isLoading: contractLoading,
    error: contractError,
    getRandomActiveGame,
    getActiveGamesCount,
    submitGuess: submitContractGuess,
    getGameInfo,
    isPlayerInGame,
  } = useContract();

  // Game state
  const [gameId, setGameId] = useState<number | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [guess, setGuess] = useState('');
  const [letterInputs, setLetterInputs] = useState<string[]>([]);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);

  // Load a random active game on component mount
  useEffect(() => {
    const loadGame = async () => {
      if (!isConnected) {
        setIsLoadingGame(false);
        return;
      }

      try {
        setIsLoadingGame(true);
        const count = await getActiveGamesCount();

        if (count === 0) {
          setIsLoadingGame(false);
          return;
        }

        // Get a random active game
        const randomGameId = await getRandomActiveGame();
        console.log(`🎲 Loaded random game ID: ${randomGameId}`);

        // Fetch game data
        const gameInfo = await getGameInfo(randomGameId);
        console.log('📊 Game info:', gameInfo);

        setGameId(randomGameId);
        setGameData(gameInfo);
        // Initialize letter inputs array
        setLetterInputs(new Array(gameInfo.middleWordLength).fill(''));

        // Auto-focus first input after a short delay
        setTimeout(() => {
          const firstInput = document.getElementById(
            'letter-0'
          ) as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 100);
      } catch (error: any) {
        console.error('❌ Error loading game:', error);
      } finally {
        setIsLoadingGame(false);
      }
    };

    loadGame();
  }, [
    isConnected,
    address,
    getActiveGamesCount,
    getRandomActiveGame,
    getGameInfo,
    isPlayerInGame,
  ]);

  // Handle letter input changes
  const handleLetterChange = (index: number, value: string) => {
    // Only allow single letters
    if (value.length > 1) {
      return;
    }

    // Only allow letters
    if (value && !/^[a-zA-Z]$/.test(value)) {
      return;
    }

    const newLetterInputs = [...letterInputs];
    newLetterInputs[index] = value.toLowerCase();
    setLetterInputs(newLetterInputs);

    // Update the guess string
    const newGuess = newLetterInputs.join('');
    setGuess(newGuess);

    // Auto-advance to next input if a letter was entered
    if (value && index < letterInputs.length - 1) {
      setTimeout(() => {
        const nextInput = document.getElementById(
          `letter-${index + 1}`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }, 0);
    }
  };

  // Handle key events for seamless typing
  const handleLetterKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (letterInputs[index]) {
        // Clear current letter
        handleLetterChange(index, '');
      } else if (index > 0) {
        // Move to previous letter and clear it
        const newLetterInputs = [...letterInputs];
        newLetterInputs[index - 1] = '';
        setLetterInputs(newLetterInputs);
        setGuess(newLetterInputs.join(''));
        // Focus previous input
        const prevInput = document.getElementById(
          `letter-${index - 1}`
        ) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    } else if (e.key === 'Enter') {
      // Submit if we have a complete word
      if (
        letterInputs.every(letter => letter !== '') &&
        !isSubmittingGuess &&
        gameData.isActive
      ) {
        handleGuessSubmit();
      }
    }
  };

  const handleGuessSubmit = async () => {
    const currentGuess = letterInputs.join('');
    if (!currentGuess.trim() || !gameId) {
      return;
    }

    try {
      setIsSubmittingGuess(true);
      console.log(`🎯 Submitting guess: ${guess}`);

      // Convert guess to lowercase for case-insensitive comparison
      const normalizedGuess = currentGuess.trim().toLowerCase();
      console.log(`📝 Normalized guess: ${normalizedGuess}`);

      await submitContractGuess(gameId, normalizedGuess, gameData.entryFee);

      // Transaction is now confirmed with 2 block confirmations
      // Check if the guess was correct by refreshing game data
      const updatedGameInfo = await getGameInfo(gameId);
      console.log('📊 Updated game info:', updatedGameInfo);

      if (!updatedGameInfo.isActive) {
        // Game ended - player won!
        const platformFee = parseFloat(updatedGameInfo.totalPrize) * 0.05;
        const winnerPrize =
          parseFloat(updatedGameInfo.totalPrize) - platformFee;
        toast.success(`🎉 Correct! You won ${winnerPrize.toFixed(4)} ETH!`, {
          duration: 5000,
        });
        setGameData(updatedGameInfo);
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        // Incorrect guess
        toast.error('Incorrect guess. Try again!');
        setGameData(updatedGameInfo);

        // Reset letter inputs
        setLetterInputs(new Array(gameData.middleWordLength).fill(''));
        setGuess('');

        // Re-focus first input for next guess
        setTimeout(() => {
          const firstInput = document.getElementById(
            'letter-0'
          ) as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ Failed to submit guess:', error);
      toast.error(error.message || 'Failed to submit guess');
    } finally {
      setIsSubmittingGuess(false);
    }
  };

  // Loading state
  if (isLoadingGame) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-700'>Loading game...</p>
        </div>
      </div>
    );
  }

  // No wallet connected state
  if (!isConnected) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <div className='mb-8'>
            <div className='w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl font-bold text-white'>G</span>
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Connect Wallet
            </h1>
            <p className='text-gray-600'>Connect your wallet to play!</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className='w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors'
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // No game available state
  if (!gameId || !gameData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <div className='mb-8'>
            <div className='w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl font-bold text-white'>G</span>
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              No Active Games
            </h1>
            <p className='text-gray-600'>
              No games available right now. Check back later!
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center p-3'>
      <div className='max-w-md mx-auto w-full'>
        {/* Header with Prize */}
        <div className='bg-white rounded-t-2xl p-4 text-center'>
          <div className='text-xs text-gray-500 mb-2'>Game #{gameId}</div>
          <div className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg'>
            <div className='text-sm'>Prize Pool</div>
            <div className='text-2xl'>
              {parseFloat(gameData.totalPrize).toFixed(4)} ETH
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className='bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-y border-purple-200'>
          <p className='text-center text-sm text-gray-700'>
            💡 Find the word connecting these two!
          </p>
        </div>

        {/* Game Board */}
        <div className='bg-white p-4'>
          {/* Top Word */}
          <div className='text-center mb-3'>
            <div className='text-xl font-bold text-gray-900 bg-gray-100 py-2 px-4 rounded-lg'>
              {gameData.topWord.toUpperCase()}
            </div>
          </div>

          {/* Middle Word (Letter Inputs) */}
          <div className='text-center mb-3'>
            <div className='flex justify-center items-center gap-1 bg-purple-100 py-2 px-4 rounded-lg border-2 border-purple-300'>
              {letterInputs.map((letter, index) => (
                <input
                  key={index}
                  id={`letter-${index}`}
                  type='text'
                  value={letter.toUpperCase()}
                  onChange={e => handleLetterChange(index, e.target.value)}
                  onKeyDown={e => handleLetterKeyDown(index, e)}
                  placeholder='_'
                  style={{
                    width: `${Math.max(
                      24,
                      Math.min(36, 220 / gameData.middleWordLength)
                    )}px`,
                    height: `${Math.max(
                      32,
                      Math.min(40, 220 / gameData.middleWordLength + 8)
                    )}px`,
                    fontSize: `${Math.max(
                      16,
                      Math.min(24, 220 / gameData.middleWordLength)
                    )}px`,
                  }}
                  className='text-center font-bold bg-transparent border-none outline-none text-purple-600 placeholder-purple-400 focus:outline-none uppercase'
                  disabled={isSubmittingGuess || !gameData.isActive}
                  autoComplete='off'
                  autoCapitalize='off'
                  autoCorrect='off'
                  spellCheck='false'
                  maxLength={1}
                  inputMode='text'
                />
              ))}
            </div>
          </div>

          {/* Bottom Word */}
          <div className='text-center mb-4'>
            <div className='text-xl font-bold text-gray-900 bg-gray-100 py-2 px-4 rounded-lg'>
              {gameData.bottomWord.toUpperCase()}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGuessSubmit}
            disabled={
              isSubmittingGuess ||
              letterInputs.some(letter => letter === '') ||
              !gameData.isActive
            }
            className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmittingGuess
              ? 'Submitting...'
              : `Submit Guess (${gameData.entryFee} ETH)`}
          </button>
        </div>

        {/* Footer */}
        <div className='bg-white rounded-b-2xl px-4 py-2 text-center'>
          <div className='text-xs text-gray-500'>
            💡 {gameData.entryFee} ETH per guess
          </div>
        </div>
      </div>
    </div>
  );
}
