'use client';

import { MiniAppProvider } from '@/contexts/miniapp-context';
import { UserProvider } from '@/contexts/user-context';
import { GameProvider } from '@/contexts/game-context';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

const ErudaProvider = dynamic(
  () => import('../components/Eruda').then(c => c.ErudaProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErudaProvider>
      <MiniAppProvider addMiniAppOnLoad={true}>
        <UserProvider autoSignIn={true}>
          <GameProvider>
            {children}
            <Toaster
              position='bottom-center'
              expand={false}
              closeButton={false}
              toastOptions={{
                unstyled: false,
                classNames: {
                  toast: 'backdrop-blur-sm shadow-2xl border-0',
                  title: 'font-semibold',
                  description: 'text-sm',
                },
                style: {
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '15px',
                  fontWeight: '500',
                },
              }}
            />
          </GameProvider>
        </UserProvider>
      </MiniAppProvider>
    </ErudaProvider>
  );
}
