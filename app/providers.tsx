'use client';

import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';
import { createContext, useContext, useEffect, useState } from 'react';

const queryClient = new QueryClient();

interface AppContextType {
  isMobile: boolean;
}

// Create the context with an initial value
const AppContext: React.Context<AppContextType | undefined> = createContext<
  AppContextType | undefined
>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobile(
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      )
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isMobile,
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AppContext.Provider>
  );
}

// Custom hook to use the App context
export const useApp = () => {
  const context = useContext(AppContext);
  // Throw an error if the hook is used outside of a Providers
  if (!context) {
    throw new Error('useApp must be used within a Providers');
  }
  return context;
};
