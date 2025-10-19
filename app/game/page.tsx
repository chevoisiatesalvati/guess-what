import dynamic from 'next/dynamic';

const GameComponent = dynamic(() => import('@/components/Game'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
      <div className="text-white text-xl">Loading Game Lobby...</div>
    </div>
  ),
});

export default function GamePage() {
  return <GameComponent />;
}
