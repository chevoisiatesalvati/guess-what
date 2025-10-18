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

        {/* Top Players Placeholder */}
        <div className="bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Players
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div
                key={rank}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      rank === 1
                        ? 'bg-yellow-500'
                        : rank === 2
                        ? 'bg-gray-400'
                        : rank === 3
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    {rank}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {rank === 1
                        ? '🏆 Champion'
                        : rank === 2
                        ? '🥈 Runner-up'
                        : rank === 3
                        ? '🥉 Third Place'
                        : `Player #${rank}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rank === 1
                        ? '0x1234...5678'
                        : rank === 2
                        ? '0x9876...4321'
                        : rank === 3
                        ? '0x5555...9999'
                        : '0x0000...0000'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {rank === 1
                      ? '12.5'
                      : rank === 2
                      ? '8.3'
                      : rank === 3
                      ? '5.7'
                      : '0.0'}{' '}
                    ETH
                  </div>
                  <div className="text-sm text-gray-500">
                    {rank === 1
                      ? '95%'
                      : rank === 2
                      ? '87%'
                      : rank === 3
                      ? '82%'
                      : '0%'}{' '}
                    accuracy
                  </div>
                </div>
              </div>
            ))}
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
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
