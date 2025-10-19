'use client';

import { useGame } from '@/contexts/game-context';
import { useContract } from '@/hooks/use-contract';
import { useAccount } from 'wagmi';
import { useState, useEffect, useRef } from 'react';

export default function Game() {
  const {
    currentGame,
    playerStats,
    isPlaying,
    timeRemaining,
    startNewGame,
    submitGuess,
    endGame,
    resetGame,
  } = useGame();

  const {
    isConnected,
    isLoading: contractLoading,
    error: contractError,
    createGame: createContractGame,
    joinGame: joinContractGame,
    submitGuess: submitContractGuess,
    switchToBaseNetwork,
    getNextGameId,
    isGameAvailable,
    getRandomActiveGame,
    getActiveGamesCount,
  } = useContract();

  const { address } = useAccount();
  const [guess, setGuess] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [contractGameId, setContractGameId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when game starts
  useEffect(() => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Submitting guess:', guess);
    console.log('🎮 Is playing:', isPlaying);
    console.log('🔗 Is connected:', isConnected);
    console.log('🆔 Contract game ID:', contractGameId);
    
    if (!guess.trim() || !isPlaying) {
      console.log('❌ Invalid guess or not playing');
      return;
    }

    try {
      // Submit to smart contract if connected and has contract game ID
      if (isConnected && contractGameId) {
        console.log('📝 Submitting guess to contract...');
        try {
          await submitContractGuess(contractGameId, guess);
          console.log('✅ Contract guess submitted successfully');
        } catch (contractError: any) {
          console.error('❌ Contract guess submission failed:', contractError);
          setResultMessage(`Contract error: ${contractError.message}`);
          setShowResult(true);
          setTimeout(() => setShowResult(false), 3000);
          return;
        }
      } else {
        console.log('📱 No contract game, submitting locally only');
      }

      console.log('🎯 Processing local guess...');
      const result = submitGuess(guess);
      console.log('📊 Guess result:', result);
      
      setResultMessage(result.message);
      setShowResult(true);

      if (result.success) {
        console.log('🎉 Guess was correct!');
        setGuess('');
        setTimeout(() => {
          setShowResult(false);
          resetGame();
        }, 3000);
      } else {
        console.log('❌ Guess was incorrect');
        setGuess('');
        setTimeout(() => {
          setShowResult(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error submitting guess:', error);
      setResultMessage(`Error: ${error.message}`);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
    }
  };

  const handleStartGame = async () => {
    console.log('🎮 Starting new game...');
    console.log('🔗 Wallet connected:', isConnected);
    console.log('📊 Contract loading:', contractLoading);
    
    try {
      // If wallet is connected, try to get a random active game
      if (isConnected) {
        console.log('🔗 Wallet connected, looking for random active game...');
        
        try {
          // Check if there are any active games
          const activeGamesCount = await getActiveGamesCount();
          console.log('📊 Active games count:', activeGamesCount);
          
          if (activeGamesCount > 0) {
            // Get a random active game
            const randomGameId = await getRandomActiveGame();
            console.log(`🎲 Random game ID: ${randomGameId}`);
            
            // Join the random game
            console.log(`✅ Joining random game ${randomGameId}...`);
            await joinContractGame(randomGameId, '0.001');
            setContractGameId(randomGameId);
            setResultMessage(`Joined random game ${randomGameId}! Playing with real ETH prizes!`);
            setShowResult(true);
            setTimeout(() => setShowResult(false), 3000);
            
            // Start local game with the contract game data
            startNewGame(0.001);
            setGuess('');
            setShowResult(false);
          } else {
            console.log('❌ No active games available');
            setResultMessage('No active games available. Game running locally only.');
            setShowResult(true);
            setTimeout(() => setShowResult(false), 3000);
            
            // Start local game anyway
            startNewGame(0.001);
            setGuess('');
            setShowResult(false);
          }
        } catch (contractError: any) {
          console.error('❌ Contract operations failed:', contractError);
          setResultMessage(`Contract error: ${contractError.message}. Game running locally.`);
          setShowResult(true);
          setTimeout(() => setShowResult(false), 3000);
          
          // Start local game anyway
          startNewGame(0.001);
          setGuess('');
          setShowResult(false);
        }
      } else {
        console.log('📱 No wallet connected, running local game only');
        setResultMessage('Game started locally! Connect wallet for blockchain features.');
        setShowResult(true);
        setTimeout(() => setShowResult(false), 3000);
        
        // Start local game
        startNewGame(0.001);
        setGuess('');
        setShowResult(false);
      }
    } catch (error: any) {
      console.error('❌ Error starting game:', error);
      setResultMessage(`Error starting game: ${error.message}`);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
      
      // Start local game anyway
      startNewGame(0.001);
      setGuess('');
      setShowResult(false);
    }
  };

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">G</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Guess What?
            </h1>
            <p className="text-gray-600">Whaaaaaaaat?</p>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {playerStats.gamesPlayed}
              </div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {playerStats.correctGuesses}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {playerStats.accuracy.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {playerStats.totalWinnings.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">ETH Won</div>
            </div>
          </div>

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 text-sm">
                <strong>Connect your wallet</strong> to play with real ETH
                prizes!
              </div>
              <button
                onClick={switchToBaseNetwork}
                className="mt-2 w-full bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Connect Wallet & Switch to Base
              </button>
            </div>
          )}

          {/* Contract Loading State */}
          {contractLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-800 text-sm text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Processing blockchain transaction...
              </div>
            </div>
          )}

          {/* Contract Error */}
          {contractError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm">
                <strong>Error:</strong> {contractError}
              </div>
            </div>
          )}

          <button
            onClick={handleStartGame}
            disabled={contractLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {contractLoading
              ? 'Joining Game...'
              : 'Join a Game (0.001 ETH)'}
          </button>

          <div className="mt-4">
            <button
              onClick={() => (window.location.href = '/leaderboard')}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Game #{currentGame.id.slice(-6)}
            </div>
            <div className="text-sm text-gray-600">
              Prize: {currentGame.totalPrize.toFixed(3)} ETH
            </div>
          </div>

          {/* Timer */}
          <div className="mb-6">
            <div
              className={`text-4xl font-bold ${
                timeRemaining <= 10 ? 'text-red-500' : 'text-gray-900'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Time Remaining</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white p-6">
          {/* Top Word */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900 bg-gray-100 py-3 px-6 rounded-lg">
              {currentGame.words.top.toUpperCase()}
            </div>
          </div>

          {/* Middle Word (Hidden) */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-purple-600 bg-purple-100 py-4 px-6 rounded-lg border-2 border-purple-300">
              {currentGame.middleWordHint}
            </div>
            <div className="text-sm text-gray-500 mt-2">Guess the word</div>
          </div>

          {/* Bottom Word */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-gray-900 bg-gray-100 py-3 px-6 rounded-lg">
              {currentGame.words.bottom.toUpperCase()}
            </div>
          </div>

          {/* Result Display */}
          {showResult && (
            <div
              className={`text-center py-4 px-6 rounded-lg mb-4 ${
                resultMessage.includes('Correct')
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}
            >
              <div className="font-bold text-lg">{resultMessage}</div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleGuessSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="w-full text-center text-xl font-semibold py-4 px-6 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-500"
                disabled={!isPlaying}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <button
              type="submit"
              disabled={!isPlaying || !guess.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPlaying ? 'Submit Guess' : 'Game Ended'}
            </button>
          </form>

          {/* Game Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              End Game
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-b-2xl p-4 text-center">
          <div className="text-sm text-gray-600">
            Speed is key! Multiple players can play the same game.
          </div>
        </div>
      </div>
    </div>
  );
}
