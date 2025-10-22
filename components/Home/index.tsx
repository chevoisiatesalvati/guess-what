'use client';

import { useUser } from '@/contexts/user-context';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useContract } from '@/hooks/use-contract';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import YourStats from '@/components/YourStats';
import GameRules from '@/components/GameRules';

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { address } = useAccount();
  const router = useRouter();
  const { isAdmin: checkIsAdmin } = useContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Use real user data from context
  const currentUser = user || {
    data: {
      fid: 12345,
      username: 'testuser',
      display_name: 'Test User',
      pfp_url: '/images/icon.png',
      bio: 'Test user for development',
      follower_count: 100,
      following_count: 50,
      verifications: [],
      active_status: 'active',
      power_badge: false,
      viewer_context: {
        following: false,
        followed_by: false,
      },
    },
    isLoading: false,
    error: null,
  };

  // Navigation handlers
  const goToGame = () => {
    router.push('/game');
  };

  const goToLeaderboard = () => {
    router.push('/leaderboard');
  };

  const handleGameRules = () => {
    setShowRules(true);
  };

  // Check if user is admin (dynamic check from contract)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address) {
        setCheckingAdmin(true);
        try {
          const adminStatus = await checkIsAdmin(address);
          setIsAdmin(adminStatus);
          console.log('👑 Admin status:', adminStatus);
        } catch (error) {
          console.error('❌ Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [address, checkIsAdmin]);

  // Show login screen if user is not authenticated
  if (!user?.data && !isLoading) {
    return (
      <div className='bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex min-h-screen flex-col items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center space-y-6 bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20'
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className='text-7xl mb-4'
          >
            🎯
          </motion.div>
          <h1 className='text-5xl font-bold text-white'>Guess What?</h1>
          <p className='text-xl text-white/90'>🔐 Sign in to start playing!</p>
          <p className='text-sm text-white/70'>
            {address
              ? `🔗 ${address.substring(0, 6)}...${address.substring(
                  address.length - 4
                )}`
              : '⚠️ No wallet connected'}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signIn}
            disabled={isLoading}
            className='px-8 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 min-w-[200px]'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600' />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>✨ Sign In</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className='bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex min-h-screen flex-col items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center space-y-4'
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='text-6xl'
          >
            🎮
          </motion.div>
          <p className='text-xl text-white font-semibold'>
            Loading your game...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show game interface for authenticated users
  return (
    <div className='bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 min-h-screen flex flex-col'>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className='bg-white/10 backdrop-blur-md text-white p-3 border-b border-white/20 flex-shrink-0'
      >
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className='flex items-center space-x-3'
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl'
            >
              🎯
            </motion.div>
            <h1 className='text-2xl font-bold'>Guess What?</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='flex items-center space-x-3'
          >
            {currentUser.isLoading ? (
              <div className='w-10 h-10 bg-white/20 rounded-full animate-pulse' />
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={currentUser.data?.pfp_url || '/images/icon.png'}
                  alt='Profile'
                  className='w-10 h-10 rounded-full border-2 border-white/50'
                  width={40}
                  height={40}
                />
              </motion.div>
            )}
            <span className='font-semibold text-sm'>
              {currentUser.isLoading
                ? 'Loading...'
                : currentUser.data?.display_name || 'User'}
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className='flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full p-4 overflow-y-auto'>
        {/* Top Content */}
        <div className='flex-1 flex flex-col'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-center mb-4'
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className='text-5xl mb-2'
            >
              🧠
            </motion.div>
            <h2 className='text-3xl font-bold text-white mb-1'>
              Ready to Play?
            </h2>
            <p className='text-sm text-white/70'>
              Guess the word, win the prize!
            </p>
          </motion.div>

          {/* Your Stats */}
          <YourStats />
        </div>

        {/* Game Actions - Always at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className='space-y-4 flex-shrink-0'
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.92 }}
            onClick={goToGame}
            className='w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 text-lg flex items-center justify-center gap-3'
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className='text-2xl'
            >
              🎯
            </motion.span>
            <span>Play Game</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className='text-2xl'
            >
              🎮
            </motion.span>
          </motion.button>

          <div className='grid grid-cols-2 gap-3'>
            <motion.button
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={goToLeaderboard}
              className='bg-white/95 backdrop-blur-sm text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20 flex items-center justify-center gap-2'
            >
              <span className='text-xl'>🏅</span>
              <span className='text-sm'>Leaderboard</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={handleGameRules}
              className='bg-white/95 backdrop-blur-sm text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20 flex items-center justify-center gap-2'
            >
              <span className='text-xl'>📖</span>
              <span className='text-sm'>Rules</span>
            </motion.button>
          </div>

          {/* Admin Link */}
          {checkingAdmin ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-4'
            >
              <div className='w-full bg-white/50 backdrop-blur-sm text-gray-700 font-medium py-3 px-4 rounded-xl text-center border border-white/20'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mx-auto mb-2'></div>
                Checking admin status...
              </div>
            </motion.div>
          ) : isAdmin ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => router.push('/admin')}
                className='w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 px-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2'
              >
                <span className='text-2xl'>👑</span>
                <span>Admin Panel</span>
              </motion.button>
            </motion.div>
          ) : null}
        </motion.div>
      </main>

      {/* Game Rules Modal */}
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
