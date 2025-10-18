'use client';

import { MiniAppProvider } from '@/contexts/miniapp-context';
import { UserProvider } from '@/contexts/user-context';
import { GameProvider } from '@/contexts/game-context';
import dynamic from 'next/dynamic';

const ErudaProvider = dynamic(
  () => import('../components/Eruda').then((c) => c.ErudaProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErudaProvider>
      <MiniAppProvider addMiniAppOnLoad={true}>
        <UserProvider autoSignIn={true}>
          <GameProvider>{children}</GameProvider>
        </UserProvider>
      </MiniAppProvider>
    </ErudaProvider>
  );
}
