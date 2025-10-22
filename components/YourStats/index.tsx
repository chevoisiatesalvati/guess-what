'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/use-contract';
import { useEffect, useState } from 'react';

interface PlayerStats {
  gamesPlayed: number;
  guessesPlayed: number;
  correctGuesses: number;
  accuracy: number;
  totalWinnings: string;
}

export default function YourStats() {
  const { address } = useAccount();
  const { getPlayerStats } = useContract();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const stats = await getPlayerStats();
        setPlayerStats(stats);
      } catch (error) {
        console.error('Error fetching player stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [address, getPlayerStats]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white/95 backdrop-blur-sm rounded-2xl p-3 mb-2 shadow-xl border border-white/20 flex-shrink-0'
      >
        <h2 className='text-base font-bold text-gray-900 mb-2 flex items-center gap-2'>
          <span className='text-lg'>📊</span>
          Your Stats
        </h2>
        <div className='flex items-center justify-center py-8'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='text-3xl'
          >
            🏆
          </motion.div>
          <div className='text-white text-lg font-semibold ml-3'>
            Loading stats...
          </div>
        </div>
      </motion.div>
    );
  }

  if (!playerStats) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='bg-white/95 backdrop-blur-sm rounded-2xl p-3 mb-2 shadow-xl border border-white/20 flex-shrink-0'
    >
      <h2 className='text-base font-bold text-gray-900 mb-2 flex items-center gap-2'>
        <span className='text-lg'>📊</span>
        Your Stats
      </h2>
      <div className='grid grid-cols-3 gap-2'>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-xl text-center border border-blue-200'
        >
          <div className='text-xl mb-0.5'>🎮</div>
          <div className='text-lg font-bold text-blue-600'>
            {playerStats.gamesPlayed}
          </div>
          <div className='text-xs text-gray-600 font-medium'>Games</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-xl text-center border border-green-200'
        >
          <div className='text-xl mb-0.5'>🏆</div>
          <div className='text-lg font-bold text-green-600'>
            {playerStats.correctGuesses}
          </div>
          <div className='text-xs text-gray-600 font-medium'>Wins</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-xl text-center border border-purple-200'
        >
          <div className='text-xl mb-0.5'>⭐</div>
          <div className='text-lg font-bold text-purple-600'>
            {playerStats.accuracy.toFixed(1)}%
          </div>
          <div className='text-xs text-gray-600 font-medium'>Win Rate</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-yellow-50 to-yellow-100 p-2 rounded-xl text-center border border-yellow-200'
        >
          <div className='text-xl mb-0.5'>💰</div>
          <div className='text-lg font-bold text-yellow-600'>
            {parseFloat(playerStats.totalWinnings).toFixed(4)}
          </div>
          <div className='text-xs text-gray-600 font-medium'>ETH Won</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-xl text-center border border-orange-200'
        >
          <div className='text-xl mb-0.5'>💭</div>
          <div className='text-lg font-bold text-orange-600'>
            {playerStats.guessesPlayed}
          </div>
          <div className='text-xs text-gray-600 font-medium'>Guesses</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className='bg-gradient-to-br from-pink-50 to-pink-100 p-2 rounded-xl text-center border border-pink-200'
        >
          <div className='text-xl mb-0.5'>📈</div>
          <div className='text-lg font-bold text-pink-600'>
            {playerStats.gamesPlayed > 0
              ? (playerStats.guessesPlayed / playerStats.gamesPlayed).toFixed(1)
              : '0'}
          </div>
          <div className='text-xs text-gray-600 font-medium'>Avg/Game</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
