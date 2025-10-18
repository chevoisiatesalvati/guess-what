import dynamic from 'next/dynamic';

const LeaderboardComponent = dynamic(() => import('@/components/Leaderboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
      <div className="text-white text-xl">Loading Leaderboard...</div>
    </div>
  ),
});

export default function LeaderboardPage() {
  return <LeaderboardComponent />;
}
