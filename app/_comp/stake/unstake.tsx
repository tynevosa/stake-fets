'use client';

import Image from 'next/image';
import { Stake } from './stake';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { abi as stakingAbi } from '@/lib/FETSStaking.json';
import { CONSTANTS, LOCK_DURATION_SECONDS } from '@/constants';
import { useCallback, useEffect, useMemo } from 'react';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '@/wagmi';
import { useApp } from '@/app/providers';

interface UnstakeProps {
  type: 'Locked' | 'Flexible';
}

export const Unstake: React.FC<UnstakeProps> = ({ type }) => {
  const { isMobile } = useApp();
  const { address: userAddress } = useAccount();

  const { data: _balance, refetch: updateBalance } = useBalance({
    address: userAddress,
    token: CONSTANTS.TOKEN_CONTRACT_ADDRESS,
  });

  const { data: _stake, refetch: fetchStake } = useReadContract({
    address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: type === 'Locked' ? 'lockedStakes' : 'flexibleStakes',
    args: [userAddress],
  });

  const { data: _currentAPY, refetch: fetchCurrentAPY } = useReadContract({
    address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'getCurrentAPY',
    args: [type === 'Locked'],
  });

  const { data: _totalStake, refetch: fetchTotalStake } = useReadContract({
    address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName:
      type === 'Locked' ? 'totalStakedLocked' : 'totalStakedFlexible',
  });

  const { data: _pendingReward, refetch: fetchPendingReward } = useReadContract(
    {
      address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'getPendingReward',
      args: [userAddress, type === 'Locked'],
    }
  );

  const balance = useMemo(
    () => (_balance ? formatUnits(_balance.value, _balance.decimals) : '0'),
    [_balance]
  );

  const stake = useMemo(() => {
    const [amount, startTime] = _stake
      ? (_stake as [bigint, bigint, boolean, bigint])
      : [];
    return {
      amount: amount ? formatUnits(amount, 18) : '0',
      startTime: startTime ? new Date(Number(startTime) * 1000) : null,
    };
  }, [_stake]);

  const currentAPY = useMemo(() => {
    const apy = _currentAPY ? formatUnits(_currentAPY as bigint, 18) : '0';
    return (parseFloat(apy) * 100).toFixed(2);
  }, [_currentAPY]);

  const totalStake = useMemo(
    () => (_totalStake ? formatUnits(_totalStake as bigint, 18) : '0'),
    [_totalStake]
  );

  const pendingReward = useMemo(
    () => (_pendingReward ? formatUnits(_pendingReward as bigint, 18) : '0'),
    [_pendingReward]
  );

  const remainingDays = useMemo(() => {
    if (!stake.startTime) return 0;

    const now = Date.now(); // current time in ms
    const start = stake.startTime.getTime(); // convert to ms
    const end = start + LOCK_DURATION_SECONDS * 1000; // unlock time in ms

    const msRemaining = end - now;
    const daysRemaining = Math.max(0, msRemaining / (1000 * 60 * 60 * 24));

    return Math.ceil(daysRemaining); // round up to the next full day
  }, [stake.startTime]);

  const refresh = useCallback(() => {
    updateBalance();
    fetchStake();
    fetchCurrentAPY();
    fetchTotalStake();
    fetchPendingReward();
  }, [
    updateBalance,
    fetchStake,
    fetchCurrentAPY,
    fetchTotalStake,
    fetchPendingReward,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [refresh]);

  const { writeContractAsync: unstake } = useWriteContract({
    mutation: {
      async onSuccess(data) {
        await toast.promise(waitForTransactionReceipt(config, { hash: data }), {
          loading: 'Unstaking token...',
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
  const handleUnstake = async () => {
    await unstake({
      address: CONSTANTS.STAKE_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'unstake',
      args: [type === 'Locked'],
    });
    refresh();
  };

  return (
    <div className="w-full shadow-[0_0_12px_rgba(11,147,209,0.5)] rounded-lg">
      <div className="w-full flex justify-between items-start bg-[#0a0f0b] rounded-t-lg p-4">
        <div className="flex gap-2">
          <Image
            src="https://s2.coinmarketcap.com/static/img/coins/64x64/26778.png"
            alt="FETS Logo"
            width={50}
            height={50}
            className={`rounded-full ${isMobile ? 'hidden' : 'block'}`}
          />
          <div>
            <span className="text-xl font-bold">{type} FETS</span>
            <br />
            <span className="text-sm">
              {type === 'Locked'
                ? 'Lock $FETS for high APY.'
                : 'Flexible staking on the side.'}
            </span>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            Total $FETS Staked
            <br />
            {parseFloat(totalStake).toFixed(2)}
          </div>
          <div className="text-center">
            APR
            <br />
            {currentAPY}%
          </div>
        </div>
      </div>
      <div
        className={`w-full flex justify-between items-stretch bg-black rounded-b-lg p-4 gap-8 ${
          isMobile ? 'flex-col' : 'flex-row'
        }`}
      >
        <div
          className={`border border-white/50 rounded-2xl p-4 gap-4 flex flex-col items-center justify-between ${
            !isMobile && 'px-8'
          }`}
        >
          <div className="flex w-full justify-around gap-4">
            <div className="flex flex-col items-center gap-4 font-bold text-center">
              $FETS EARNED
              <br />
              <br />
              {parseFloat(pendingReward)
                ? parseFloat(pendingReward).toFixed(2)
                : 'N/A'}
            </div>
            <div className="flex flex-col items-center gap-4 font-bold text-center">
              $FETS STAKED
              <br />
              <br />
              {parseFloat(stake.amount)
                ? parseFloat(stake.amount).toFixed(2)
                : 'N/A'}
            </div>
            <div className="flex flex-col items-center gap-4 font-bold text-center">
              UNLOCKS IN
              <br />
              <br />
              {type === 'Locked'
                ? parseFloat(stake.amount)
                  ? `${remainingDays} days`
                  : 'N/A'
                : 'Anytime'}
            </div>
          </div>
          <button
            className={`p-2 rounded-md text-[17px] font-medium text-white border-white cursor-pointer transition-all duration-500 ease-in-out select-none hover:text-white hover:bg-[#008cff] hover:border-[#008cff] hover:[text-shadow:0_0_5px_white,0_0_10px_white,0_0_20px_white] hover:[box-shadow:0_0_5px_#008cff,0_0_20px_#008cff,0_0_50px_#008cff,0_0_100px_#008cff] ${
              isMobile ? 'bg-blue-500 border-none' : ' bg-transparent border'
            }`}
            onClick={handleUnstake}
          >
            Claim & Unstake
          </button>
        </div>
        <div
          className={`border border-white/50 rounded-2xl p-4 gap-4 flex flex-col items-center justify-between ${
            !isMobile && 'px-8'
          }`}
        >
          <Stake balance={balance} type={type} refresh={refresh} />
        </div>
      </div>
    </div>
  );
};
