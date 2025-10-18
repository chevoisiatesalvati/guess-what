'use client';

import { useUser } from '@/contexts/user-context';
import Image from 'next/image';
import { useAccount } from 'wagmi';

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();

  const { address } = useAccount();

  // Use real user data from context
  const currentUser = user || {
    data: {
      fid: 12345,
      username: 'testuser',
      display_name: 'Test User',
      pfp_url: 'https://via.placeholder.com/80x80/6366f1/ffffff?text=T',
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

  // Debug logging
  console.log('Home component - user data:', user);
  console.log('Home component - isLoading:', isLoading);
  console.log('Home component - error:', error);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold">Guess What?</h1>
          </div>
          <div className="flex items-center space-x-3">
            {currentUser.isLoading ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            ) : (
              <Image
                src={
                  currentUser.data?.pfp_url ||
                  'https://via.placeholder.com/32x32/6366f1/ffffff?text=U'
                }
                alt="Profile"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            )}
            <span className="font-medium">
              {currentUser.isLoading
                ? 'Loading...'
                : currentUser.data?.display_name || 'User'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Guess What?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Test your word association skills! Can you guess the word that
            connects the other two?
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Games Played</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">Correct Guesses</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
            <div className="text-gray-600">Accuracy</div>
          </div>
        </div>

        {/* Game Actions */}
        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            Start New Game
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              View Leaderboard
            </button>
            <button className="bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Game Rules
            </button>
          </div>
        </div>

        {/* Recent Games */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Games
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
            <p>No games played yet. Start your first game!</p>
          </div>
        </div>
      </main>

      {/* Commented out original sign-in code for future reference */}
      {/* 
      <div className="bg-white text-black flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-lg text-muted-foreground">
            {user?.data ? 'You are signed in!' : 'Sign in to get started'}
          </p>
          <p className="text-lg text-muted-foreground">
            {address
              ? `${address.substring(0, 6)}...${address.substring(
                  address.length - 4
                )}`
              : 'No address found'}
          </p>

          {!user?.data ? (
            <button
              onClick={signIn}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 min-w-[160px] min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {user && (
                <div className="flex flex-col items-center space-y-2 min-h-[160px] justify-center">
                  {user.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={user.data.pfp_url!}
                        alt="Profile"
                        className="w-20 h-20 rounded-full"
                        width={80}
                        height={80}
                      />
                      <div className="text-center">
                        <p className="font-semibold">{user.data.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.data.username}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      */}
    </div>
  );
}
