'use client';

import { useContract } from '@/hooks/use-contract';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
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

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guess.trim() || !gameId) {
      return;
    }

    try {
      setIsSubmittingGuess(true);
      console.log(`🎯 Submitting guess: ${guess}`);

      // Convert guess to lowercase for case-insensitive comparison
      const normalizedGuess = guess.trim().toLowerCase();
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
        setResultMessage(`🎉 Correct! You won ${winnerPrize.toFixed(4)} ETH!`);
        setShowResult(true);
        setGameData(updatedGameInfo);
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } else {
        // Incorrect guess
        setResultMessage(
          '❌ Incorrect guess. Try again! (costs 1 entry fee per guess)'
        );
        setShowResult(true);
        setGameData(updatedGameInfo);
        setTimeout(() => setShowResult(false), 3000);
      }

      setGuess('');
    } catch (error: any) {
      console.error('❌ Failed to submit guess:', error);
      setResultMessage(`Error: ${error.message}`);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
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

  // Main game interface - instant play, no join required!
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4'>
      <div className='max-w-md mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-t-2xl p-6 text-center'>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-sm text-gray-600'>Game #{gameId}</div>
            <div className='text-sm text-gray-600'>
              Prize: {parseFloat(gameData.totalPrize).toFixed(4)} ETH
            </div>
          </div>

          <div className='text-sm text-gray-600'>
            Entry Fee: {gameData.entryFee} ETH per guess
          </div>
        </div>

        {/* Game Board */}
        <div className='bg-white p-6'>
          {/* Top Word */}
          <div className='text-center mb-4'>
            <div className='text-2xl font-bold text-gray-900 bg-gray-100 py-3 px-6 rounded-lg'>
              {gameData.topWord.toUpperCase()}
            </div>
          </div>

          {/* Middle Word (Hidden) */}
          <div className='text-center mb-4'>
            <div className='text-3xl font-bold text-purple-600 bg-purple-100 py-4 px-6 rounded-lg border-2 border-purple-300'>
              {'_'.repeat(gameData.middleWordLength)}
            </div>
            <div className='text-sm text-gray-500 mt-2'>
              Guess the {gameData.middleWordLength}-letter word
            </div>
          </div>

          {/* Bottom Word */}
          <div className='text-center mb-6'>
            <div className='text-2xl font-bold text-gray-900 bg-gray-100 py-3 px-6 rounded-lg'>
              {gameData.bottomWord.toUpperCase()}
            </div>
          </div>

          {/* Result Display */}
          {showResult && (
            <div
              className={`text-center py-4 px-6 rounded-lg mb-4 ${
                resultMessage.includes('Correct') ||
                resultMessage.includes('won')
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}
            >
              <div className='font-bold text-lg'>{resultMessage}</div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleGuessSubmit} className='space-y-4'>
            <div>
              <input
                type='text'
                value={guess}
                onChange={e => setGuess(e.target.value)}
                placeholder='Type your guess here...'
                className='w-full text-center text-xl font-semibold py-4 px-6 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-500'
                disabled={isSubmittingGuess || !gameData.isActive}
                autoComplete='off'
                autoCapitalize='off'
                autoCorrect='off'
                spellCheck='false'
              />
            </div>

            <button
              type='submit'
              disabled={
                isSubmittingGuess || !guess.trim() || !gameData.isActive
              }
              className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isSubmittingGuess
                ? 'Submitting...'
                : `Submit Guess (${gameData.entryFee} ETH)`}
            </button>
          </form>

          {/* Info */}
          <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <div className='text-sm text-yellow-800 text-center'>
              💡 Each guess costs {gameData.entryFee} ETH.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='bg-white rounded-b-2xl p-4 text-center'>
          <div className='text-sm text-gray-600'>
            Be the first to guess correctly and win the prize!
          </div>
        </div>
      </div>
    </div>
  );
}
