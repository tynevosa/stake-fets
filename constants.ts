export const CONSTANTS = {
  TOKEN_CONTRACT_ADDRESS: (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS ||
    '0xf4A509313437dfC64E2EFeD14e2b607B1AED30c5') as `0x${string}`,
  STAKE_CONTRACT_ADDRESS: (process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS ||
    '0x32b2ad8179fc3be73aa27bbd923432ccb375ef64') as `0x${string}`,
};

export const LOCK_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days