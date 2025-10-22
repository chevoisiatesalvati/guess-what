'use client';

import { useUser } from '@/contexts/user-context';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useContract } from '@/hooks/use-contract';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { address } = useAccount();
  const router = useRouter();
  const { isAdmin: checkIsAdmin, getPlayerStats } = useContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    gamesPlayed: 0,
    guessesPlayed: 0,
    correctGuesses: 0,
    totalWinnings: '0',
    accuracy: 0,
  });

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
    // For now, just show an alert. Later this could be a modal or separate page
    alert(
      'Game Rules:\n\n1. You will see three words: top, middle (hidden), and bottom\n2. Guess the middle word that connects the top and bottom words\n3. You have 30 seconds to make your guess\n4. Pay the entry fee to play\n5. Win the prize pool if you guess correctly!'
    );
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

  // Fetch player stats from contract
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (address) {
        try {
          const stats = await getPlayerStats();
          if (stats) {
            setPlayerStats({
              gamesPlayed: stats.gamesPlayed,
              guessesPlayed: stats.guessesPlayed,
              correctGuesses: stats.correctGuesses,
              totalWinnings: stats.totalWinnings,
              accuracy: stats.accuracy,
            });
          }
        } catch (error) {
          console.error('❌ Error fetching player stats:', error);
        }
      }
    };

    fetchPlayerStats();
  }, [address, getPlayerStats]);

  // Show login screen if user is not authenticated
  if (!user?.data && !isLoading) {
    return (
      <div className='bg-white text-black flex min-h-screen flex-col items-center justify-center p-4'>
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold'>Guess What?</h1>
          <p className='text-lg text-muted-foreground'>
            You must first sign in!
          </p>
          <p className='text-lg text-muted-foreground'>
            {address
              ? `Connected: ${address.substring(0, 6)}...${address.substring(
                  address.length - 4
                )}`
              : 'No wallet connected'}
          </p>

          <button
            onClick={signIn}
            disabled={isLoading}
            className='px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 min-w-[160px] min-h-[48px]'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white' />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className='bg-white text-black flex min-h-screen flex-col items-center justify-center p-4'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto' />
          <p className='text-lg text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // Show game interface for authenticated users
  return (
    <div className='bg-white text-black min-h-screen'>
      {/* Header */}
      <header className='bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
              <span className='text-xl font-bold'>G</span>
            </div>
            <h1 className='text-2xl font-bold'>Guess What?</h1>
          </div>
          <div className='flex items-center space-x-3'>
            {currentUser.isLoading ? (
              <div className='w-8 h-8 bg-white/20 rounded-full animate-pulse' />
            ) : (
              <Image
                src={currentUser.data?.pfp_url || '/images/icon.png'}
                alt='Profile'
                className='w-8 h-8 rounded-full'
                width={32}
                height={32}
              />
            )}
            <span className='font-medium'>
              {currentUser.isLoading
                ? 'Loading...'
                : currentUser.data?.display_name || 'User'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto p-6'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Guess What?</h2>
          <p className='text-lg text-gray-600 mb-6'>
            You are in the right place for becoming a genius!
          </p>
        </div>

        {/* Game Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-blue-50 p-6 rounded-lg text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {playerStats.gamesPlayed}
            </div>
            <div className='text-gray-600 text-sm'>Games Played</div>
          </div>
          <div className='bg-orange-50 p-6 rounded-lg text-center'>
            <div className='text-3xl font-bold text-orange-600 mb-2'>
              {playerStats.guessesPlayed}
            </div>
            <div className='text-gray-600 text-sm'>Total Guesses</div>
          </div>
          <div className='bg-green-50 p-6 rounded-lg text-center'>
            <div className='text-3xl font-bold text-green-600 mb-2'>
              {playerStats.correctGuesses}
            </div>
            <div className='text-gray-600 text-sm'>Games Won</div>
          </div>
          <div className='bg-purple-50 p-6 rounded-lg text-center'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>
              {playerStats.accuracy.toFixed(1)}%
            </div>
            <div className='text-gray-600 text-sm'>Win Rate</div>
          </div>
        </div>

        {/* Game Actions */}
        <div className='space-y-4'>
          <button
            onClick={goToGame}
            className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'
          >
            Play Game
          </button>

          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={goToLeaderboard}
              className='bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors'
            >
              View Leaderboard
            </button>
            <button
              onClick={handleGameRules}
              className='bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Game Rules
            </button>
          </div>

          {/* Admin Link */}
          {checkingAdmin ? (
            <div className='mt-4'>
              <div className='w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-lg text-center'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mx-auto mb-2'></div>
                Checking admin status...
              </div>
            </div>
          ) : isAdmin ? (
            <div className='mt-4'>
              <button
                onClick={() => router.push('/admin')}
                className='w-full bg-red-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'
              >
                👑 Admin Panel
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
