import { farcasterFrame as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://base-sepolia.drpc.org"),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export default function MiniAppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
