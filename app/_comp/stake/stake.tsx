'use client';

import { CONSTANTS } from '@/constants';
import { config } from '@/wagmi';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { erc20Abi } from 'viem';
import { abi as stakingAbi } from '@/lib/FETSStaking.json';
import { useApp } from '@/app/providers';

interface StakeProps {
  balance: string;
  type: 'Locked' | 'Flexible';
  refresh: () => void;
}

const PERCENTAGES = [25, 50, 100];

export const Stake: React.FC<StakeProps> = ({ balance, type, refresh }) => {
  const { isMobile } = useApp();
  const { isConnected } = useAccount();

  const amountRef = useRef<HTMLInputElement>(null);

  const { writeContractAsync: approve } = useWriteContract({
    mutation: {
      async onSuccess(data) {
        await toast.promise(waitForTransactionReceipt(config, { hash: data }), {
          loading: 'Token allowance...',
          success: 'Done!',
          error: 'Failed!',
        });
      },
      onError(error) {
        toast.error(error.name);
      },
    },
  });

  const { writeContractAsync: stake } = useWriteContract({
    mutation: {
      async onSuccess(data) {
        await toast.promise(waitForTransactionReceipt(config, { hash: data }), {
          loading: 'Staking token...',
          success: 'Done!',
          error: 'Failed!',
        });
      },
      onError(error) {
        toast.error(error.name);
      },
    },
  });

  // Stake function
  const handleStake = async () => {
    if (amountRef.current) {
      const amount = amountRef.current.value;
      if (amount) {
        await approve({
          address: CONSTANTS.TOKEN_CONTRACT_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [CONSTANTS.STAKE_CONTRACT_ADDRESS, parseEther(amount)],
        });
        await stake({
          address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
          abi: stakingAbi,
          functionName: 'stake',
          args: [parseEther(amount), type === 'Locked'],
        });
        amountRef.current.value = '';
        refresh();
      } else {
        toast.error('Please enter an amount');
      }
    }
  };

  return (
    <>
      <div className="flex w-full justify-between gap-4">
        <input
          ref={amountRef}
          type="number"
          min={0}
          className="flex-1 min-w-0 rounded-lg border border-white/50 bg-transparent text-white placeholder:text-white/50 p-2"
          placeholder="Amount to stake"
        />
        <div className="flex gap-2">
          {PERCENTAGES.map((percent) => (
            <button
              key={percent}
              className={`rounded-lg font-bold bg-white text-black cursor-pointer w-auto ${
                isMobile ? 'text-sm p-1' : 'p-2 text-base'
              }`}
              onClick={() => {
                if (amountRef.current) {
                  amountRef.current.value = (
                    (parseFloat(balance) * percent) /
                    100
                  ).toString();
                }
              }}
            >
              {percent}%
            </button>
          ))}
        </div>
      </div>
      <div>
        $FETS Balance:{' '}
        {isConnected ? parseFloat(balance).toFixed(2) : 'Connect your wallet'}
      </div>
      <div className="flex w-full justify-center">
        <button
          className={`p-2 rounded-md text-[17px] font-medium text-white border-white cursor-pointer transition-all duration-500 ease-in-out select-none hover:text-white hover:bg-[#008cff] hover:border-[#008cff] hover:[text-shadow:0_0_5px_white,0_0_10px_white,0_0_20px_white] hover:[box-shadow:0_0_5px_#008cff,0_0_20px_#008cff,0_0_50px_#008cff,0_0_100px_#008cff]  ${
            isMobile ? 'bg-blue-500 border-none' : ' bg-transparent border'
          }`}
          onClick={handleStake}
        >
          Stake
        </button>
      </div>
    </>
  );
};
