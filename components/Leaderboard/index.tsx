'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/use-contract';
import { useEffect, useState } from 'react';
import ShareButton from '@/components/ShareButton';

interface LeaderboardEntry {
  address: string;
  gamesPlayed: number;
  correctGuesses: number;
  totalWinnings: string;
  accuracy: number;
  position: number;
}

export default function Leaderboard() {
  const { address } = useAccount();
  const { getPlayerStats } = useContract();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  // Mock leaderboard data for now - in a real implementation, this would come from events or a backend
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration - in production, this would be fetched from contract events
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            address: '0x1234...5678',
            gamesPlayed: 25,
            correctGuesses: 18,
            totalWinnings: '0.1250',
            accuracy: 72.0,
            position: 1,
          },
          {
            address: '0x2345...6789',
            gamesPlayed: 20,
            correctGuesses: 14,
            totalWinnings: '0.0980',
            accuracy: 70.0,
            position: 2,
          },
          {
            address: '0x3456...7890',
            gamesPlayed: 15,
            correctGuesses: 10,
            totalWinnings: '0.0750',
            accuracy: 66.7,
            position: 3,
          },
          {
            address: '0x4567...8901',
            gamesPlayed: 12,
            correctGuesses: 8,
            totalWinnings: '0.0620',
            accuracy: 66.7,
            position: 4,
          },
          {
            address: '0x5678...9012',
            gamesPlayed: 10,
            correctGuesses: 6,
            totalWinnings: '0.0450',
            accuracy: 60.0,
            position: 5,
          },
        ];

        setLeaderboard(mockLeaderboard);

        // If user is connected, try to get their stats and position
        if (address) {
          try {
            const userStats = await getPlayerStats();
            // In a real implementation, we'd calculate the user's position
            // For now, we'll just show they're not in top 5
            setUserPosition(6);
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [address, getPlayerStats]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Medal className='w-5 h-5 text-yellow-500' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-400' />;
      case 3:
        return <Medal className='w-5 h-5 text-amber-600' />;
      default:
        return (
          <span className='text-lg font-bold text-gray-600'>#{position}</span>
        );
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
      default:
        return 'bg-white text-gray-700';
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col p-3'>
      <div className='max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between'>
        {/* Top Content */}
        <div className='flex-1 flex flex-col'>
          {/* Leaderboard Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white/95 backdrop-blur-sm rounded-2xl p-3 text-center mb-2 shadow-xl border border-white/20 flex-shrink-0'
          >
            <div className='flex items-center justify-center gap-2'>
              <Trophy className='w-8 h-8 text-yellow-500' />
              <h1 className='text-2xl font-bold text-gray-900'>Leaderboard</h1>
            </div>
          </motion.div>

          {/* Leaderboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-2 shadow-xl border border-white/20 flex-1 flex flex-col min-h-0'
          >
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className='text-3xl'
                >
                  🏆
                </motion.div>
                <div className='text-gray-600 text-lg font-semibold ml-3'>
                  Loading leaderboard...
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl shadow-md ${getPositionColor(
                      entry.position
                    )}`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        {getPositionIcon(entry.position)}
                        <div>
                          <div className='font-bold text-sm'>
                            {entry.address.slice(0, 6)}...
                            {entry.address.slice(-4)}
                          </div>
                          <div className='text-xs opacity-80'>
                            {entry.gamesPlayed} games •{' '}
                            {entry.accuracy.toFixed(1)}% win rate
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-sm'>
                          {parseFloat(entry.totalWinnings).toFixed(4)} ETH
                        </div>
                        <div className='text-xs opacity-80'>
                          {entry.correctGuesses} wins
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* User Position (if not in top 5) */}
                {userPosition && userPosition > 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className='p-3 rounded-xl shadow-md bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Star className='w-5 h-5 text-purple-500' />
                        <div>
                          <div className='font-bold text-sm text-purple-700'>
                            You (Your Address)
                          </div>
                          <div className='text-xs text-purple-600'>
                            Position #{userPosition}
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-sm text-purple-700'>
                          Keep playing to climb!
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Share Leaderboard Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className='mt-4'
                >
                  <ShareButton
                    data={{
                      type: 'leaderboard',
                      position: 1, // Top position for sharing
                      gamesPlayed: leaderboard[0]?.gamesPlayed || 0,
                      accuracy: leaderboard[0]?.accuracy || 0,
                    }}
                    variant='secondary'
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Go Back Button - Always at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='flex-shrink-0'
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => window.history.back()}
            className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-white/20'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Go Back</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
