'use client';

import { useContract } from '@/hooks/use-contract';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  address: string;
  gamesPlayed: number;
  correctGuesses: number;
  totalWinnings: string;
  accuracy: number;
}

export default function Leaderboard() {
  const { address } = useAccount();
  const { getPlayerStats } = useContract();
  const [playerStats, setPlayerStats] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (address) {
        try {
          const stats = await getPlayerStats();
          if (stats) {
            setPlayerStats({
              address,
              gamesPlayed: stats.gamesPlayed,
              correctGuesses: stats.correctGuesses,
              totalWinnings: stats.totalWinnings,
              accuracy: stats.accuracy,
            });
          }
        } catch (error) {
          console.error('Failed to fetch player stats:', error);
        }
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [address, getPlayerStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Top players and your stats</p>
        </div>

        {/* Your Stats */}
        {playerStats && (
          <div className="bg-white p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {playerStats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {playerStats.correctGuesses}
                </div>
                <div className="text-sm text-gray-600">Correct Guesses</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {playerStats.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {parseFloat(playerStats.totalWinnings).toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">ETH Won</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Players Coming Soon */}
        <div className="bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Players
          </h2>
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-lg font-semibold text-blue-900 mb-2">
              Coming Soon!
            </div>
            <div className="text-sm text-blue-700">
              Global leaderboard will be available soon. Keep playing to climb the ranks!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-b-2xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-4">
            Leaderboard updates in real-time as players win games
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
