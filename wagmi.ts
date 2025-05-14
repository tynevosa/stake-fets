import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_SEPOLIA === 'true' ? [sepolia] : []),
    ...(process.env.NEXT_PUBLIC_ENABLE_HARDHAT === 'true' ? [hardhat] : []),
  ],
  ssr: true,
});
