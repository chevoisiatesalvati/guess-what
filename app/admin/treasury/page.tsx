'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/use-contract';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TreasuryPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const {
    getTreasuryBalance,
    fundTreasury,
    withdrawFromTreasury,
    getPrizeMultiplier,
    setPrizeMultiplier,
    getPlatformFee,
    setPlatformFee,
    isAdmin: checkIsAdmin,
    isLoading,
    error,
  } = useContract();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState('0');
  const [prizeMultiplier, setPrizeMultiplierState] = useState(10);
  const [platformFee, setPlatformFeeState] = useState(10);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [fundAmount, setFundAmount] = useState('0.001');
  const [withdrawAmount, setWithdrawAmount] = useState('0.001');
  const [newMultiplier, setNewMultiplier] = useState('10');
  const [newPlatformFee, setNewPlatformFee] = useState('10');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address) {
        setCheckingAdmin(true);
        try {
          const adminStatus = await checkIsAdmin(address);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('❌ Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [address, checkIsAdmin]);

  // Fetch treasury data
  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        setLoadingBalance(true);
        const [balance, multiplier, fee] = await Promise.all([
          getTreasuryBalance(),
          getPrizeMultiplier(),
          getPlatformFee(),
        ]);
        setTreasuryBalance(balance);
        setPrizeMultiplierState(multiplier);
        setNewMultiplier(multiplier.toString());
        setPlatformFeeState(fee);
        setNewPlatformFee(fee.toString());
      } catch (error) {
        console.error('Failed to fetch treasury data:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (isAdmin) {
      fetchTreasuryData();
    }
  }, [isAdmin, getTreasuryBalance, getPrizeMultiplier, getPlatformFee]);

  const refreshBalance = async () => {
    setLoadingBalance(true);
    try {
      const balance = await getTreasuryBalance();
      setTreasuryBalance(balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleFundTreasury = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('fund');

    const fundPromise = (async () => {
      await fundTreasury(fundAmount);
      setFundAmount('0.001');
      await refreshBalance();
      return fundAmount;
    })();

    toast.promise(fundPromise, {
      loading: 'Funding treasury...',
      success: amount => `Successfully funded treasury with ${amount} ETH!`,
      error: err => `Failed to fund treasury: ${err.message}`,
      finally: () => {
        setActionLoading(null);
      },
    });
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('withdraw');

    const withdrawPromise = (async () => {
      await withdrawFromTreasury(withdrawAmount);
      setWithdrawAmount('0.001');
      await refreshBalance();
      return withdrawAmount;
    })();

    toast.promise(withdrawPromise, {
      loading: 'Withdrawing from treasury...',
      success: amount => `Successfully withdrew ${amount} ETH from treasury!`,
      error: err => `Failed to withdraw: ${err.message}`,
      finally: () => {
        setActionLoading(null);
      },
    });
  };

  const handleSetMultiplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('multiplier');

    const multiplierPromise = (async () => {
      const multiplierValue = parseInt(newMultiplier);
      await setPrizeMultiplier(multiplierValue);
      setPrizeMultiplierState(multiplierValue);
      return multiplierValue;
    })();

    toast.promise(multiplierPromise, {
      loading: 'Updating prize multiplier...',
      success: value => `Prize multiplier updated to ${value}x!`,
      error: err => `Failed to update multiplier: ${err.message}`,
      finally: () => {
        setActionLoading(null);
      },
    });
  };

  const handleSetPlatformFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('platformFee');

    const feePromise = (async () => {
      const feeValue = parseInt(newPlatformFee);
      await setPlatformFee(feeValue);
      setPlatformFeeState(feeValue);
      return feeValue;
    })();

    toast.promise(feePromise, {
      loading: 'Updating platform fee...',
      success: value => `Platform fee updated to ${value}%!`,
      error: err => `Failed to update fee: ${err.message}`,
      finally: () => {
        setActionLoading(null);
      },
    });
  };

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Admin Access Required
          </h1>
          <p className='text-gray-600'>
            Please connect your wallet to access the treasury management.
          </p>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Checking Admin Status
          </h1>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>
            Access Denied
          </h1>
          <p className='text-gray-600'>You don&apos;t have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              💰 Treasury Management
            </h1>
            <p className='text-gray-600'>
              Manage game treasury and prize settings
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='text-red-800'>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Treasury Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200'>
              <div className='text-sm text-gray-600 mb-2'>Treasury Balance</div>
              <div className='text-4xl font-bold text-green-600 flex items-center'>
                {loadingBalance ? (
                  <div className='animate-pulse'>Loading...</div>
                ) : (
                  <>
                    {parseFloat(treasuryBalance).toFixed(6)} ETH
                    <button
                      onClick={refreshBalance}
                      className='ml-3 text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded'
                    >
                      🔄
                    </button>
                  </>
                )}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                Available for game prizes
              </div>
            </div>

            <div className='bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-2 border-purple-200'>
              <div className='text-sm text-gray-600 mb-2'>Prize Multiplier</div>
              <div className='text-4xl font-bold text-purple-600'>
                {prizeMultiplier}x
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                Base prize = entry fee × multiplier
              </div>
            </div>

            <div className='bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200'>
              <div className='text-sm text-gray-600 mb-2'>Platform Fee</div>
              <div className='text-4xl font-bold text-blue-600'>
                {platformFee}%
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                Fee taken from each winning prize
              </div>
            </div>
          </div>

          {/* Fund Treasury */}
          <div className='mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Fund Treasury
            </h2>
            <form onSubmit={handleFundTreasury} className='space-y-4'>
              <div>
                <label
                  htmlFor='fundAmount'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Amount (ETH)
                </label>
                <input
                  type='number'
                  id='fundAmount'
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  required
                  min='0.000000001'
                  step='0.000000001'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='0.001'
                />
              </div>
              <button
                type='submit'
                disabled={isLoading || actionLoading === 'fund'}
                className='w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {actionLoading === 'fund'
                  ? 'Funding...'
                  : `Fund Treasury with ${fundAmount} ETH`}
              </button>
            </form>
          </div>

          {/* Withdraw from Treasury */}
          <div className='mb-8 p-6 bg-orange-50 rounded-lg border border-orange-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Withdraw from Treasury
            </h2>
            <form onSubmit={handleWithdraw} className='space-y-4'>
              <div>
                <label
                  htmlFor='withdrawAmount'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Amount (ETH)
                </label>
                <input
                  type='number'
                  id='withdrawAmount'
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  required
                  min='0.000000001'
                  step='0.000000001'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  placeholder='0.001'
                />
              </div>
              <button
                type='submit'
                disabled={isLoading || actionLoading === 'withdraw'}
                className='w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {actionLoading === 'withdraw'
                  ? 'Withdrawing...'
                  : `Withdraw ${withdrawAmount} ETH`}
              </button>
            </form>
          </div>

          {/* Set Prize Multiplier */}
          <div className='mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Update Prize Multiplier
            </h2>
            <form onSubmit={handleSetMultiplier} className='space-y-4'>
              <div>
                <label
                  htmlFor='newMultiplier'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Multiplier
                </label>
                <input
                  type='number'
                  id='newMultiplier'
                  value={newMultiplier}
                  onChange={e => setNewMultiplier(e.target.value)}
                  required
                  min='1'
                  step='1'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  placeholder='10'
                />
                <p className='text-xs text-gray-500 mt-2'>
                  Current: {prizeMultiplier}x | Example: 10x means a 0.001 ETH
                  entry fee = 0.01 ETH base prize
                </p>
              </div>
              <button
                type='submit'
                disabled={isLoading || actionLoading === 'multiplier'}
                className='w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {actionLoading === 'multiplier'
                  ? 'Updating...'
                  : `Set Multiplier to ${newMultiplier}x`}
              </button>
            </form>
          </div>

          {/* Set Platform Fee */}
          <div className='mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Update Platform Fee
            </h2>
            <form onSubmit={handleSetPlatformFee} className='space-y-4'>
              <div>
                <label
                  htmlFor='newPlatformFee'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Fee Percentage
                </label>
                <input
                  type='number'
                  id='newPlatformFee'
                  value={newPlatformFee}
                  onChange={e => setNewPlatformFee(e.target.value)}
                  required
                  min='0'
                  max='50'
                  step='1'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='10'
                />
                <p className='text-xs text-gray-500 mt-2'>
                  Current: {platformFee}% | Example: 10% means a 1 ETH prize
                  pays 0.1 ETH to platform (max: 50%)
                </p>
              </div>
              <button
                type='submit'
                disabled={isLoading || actionLoading === 'platformFee'}
                className='w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {actionLoading === 'platformFee'
                  ? 'Updating...'
                  : `Set Platform Fee to ${newPlatformFee}%`}
              </button>
            </form>
          </div>

          {/* Navigation */}
          <div className='mt-8 pt-6 border-t border-gray-200 flex justify-between'>
            <button
              onClick={() => router.push('/admin')}
              className='text-purple-600 hover:text-purple-800 font-medium'
            >
              ← Back to Admin Panel
            </button>
            <button
              onClick={() => router.push('/admin/manage')}
              className='text-purple-600 hover:text-purple-800 font-medium'
            >
              Manage Admins →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
