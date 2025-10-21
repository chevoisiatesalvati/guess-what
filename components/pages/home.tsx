import dynamic from 'next/dynamic';

const HomeComponent = dynamic(() => import('@/components/Home'), {
  ssr: false,
  loading: () => (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center'>
      <div className='text-white text-xl'>Loading Home...</div>
    </div>
  ),
});

export default function HomePage() {
  return <HomeComponent />;
}
