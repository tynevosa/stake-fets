'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Unstake } from './_comp/stake/unstake';
import { useApp } from './providers';

export default function Home() {
  const { isMobile } = useApp();

  return (
    <main
      className={`relative w-screen flex flex-col items-center justify-center p-4 ${
        !isMobile && 'px-8'
      }`}
    >
      <div className="fixed w-screen h-screen inset-0 bg-[url('/background.jpg')] bg-cover -z-50" />
      <div
        className={`${
          isMobile ? 'w-full' : 'w-auto'
        } flex flex-col items-center gap-8`}
      >
        <ConnectButton />
        <h1 className="text-3xl font-bold">$FETS Stake Pool</h1>
        <Unstake type="Flexible" />
        <Unstake type="Locked" />
      </div>
    </main>
  );
}
