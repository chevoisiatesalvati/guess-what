import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { config } from '@/lib/wagmi-config';
import { useEffect } from 'react';
import { contractService } from '@/lib/contract-utils';

const queryClient = new QueryClient();

function ChainSwitcher({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const ensureCorrectChain = async () => {
      if (isConnected && address) {
        try {
          await contractService.ensureCorrectChain();
        } catch (error) {
          console.error('Failed to switch chain:', error);
        }
      }
    };

    ensureCorrectChain();
  }, [address, isConnected]);

  return <>{children}</>;
}

export default function MiniAppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChainSwitcher>{children}</ChainSwitcher>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
