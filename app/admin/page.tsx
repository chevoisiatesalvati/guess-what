'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/use-contract';
import { hashWord } from '@/lib/contract-utils';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { createGame, isLoading, error, isAdmin: checkIsAdmin } = useContract();

  const [formData, setFormData] = useState({
    topWord: '',
    middleWord: '',
    bottomWord: '',
    entryFee: '0.0001',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Dynamic admin check from contract
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address) {
        setCheckingAdmin(true);
        try {
          const adminStatus = await checkIsAdmin(address);
          setIsAdmin(adminStatus);
          console.log('👑 Admin status:', adminStatus);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Normalize and hash the middle word for security
      const normalizedTopWord = formData.topWord.trim().toLowerCase();
      const normalizedMiddleWord = formData.middleWord.trim().toLowerCase();
      const normalizedBottomWord = formData.bottomWord.trim().toLowerCase();

      // Hash the middle word to prevent reading from contract storage
      const middleWordHash = hashWord(normalizedMiddleWord);

      console.log('🔐 Creating game with hashed middle word');
      console.log('Words:', {
        normalizedTopWord,
        middleWordHash,
        normalizedBottomWord,
      });

      const gameId = await createGame(
        normalizedTopWord,
        middleWordHash,
        normalizedMiddleWord.length,
        normalizedBottomWord,
        formData.entryFee
      );

      setSuccessMessage(`Game created successfully! Game ID: ${gameId}`);

      // Reset form
      setFormData({
        topWord: '',
        middleWord: '',
        bottomWord: '',
        entryFee: '0.0001',
      });
    } catch (err: any) {
      console.error('Error creating game:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Admin Access Required
          </h1>
          <p className='text-gray-600'>
            Please connect your wallet to access the admin panel.
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
          <p className='text-gray-600'>Verifying your admin privileges...</p>
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
          <p className='text-sm text-gray-500 mt-2'>
            Only the contract owner can access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Admin Panel
            </h1>
            <p className='text-gray-600'>Create new games with prize pools</p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='text-red-800'>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='text-green-800'>
                <strong>Success:</strong> {successMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='topWord'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Top Word
              </label>
              <input
                type='text'
                id='topWord'
                name='topWord'
                value={formData.topWord}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='e.g., hack'
              />
            </div>

            <div>
              <label
                htmlFor='middleWord'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Middle Word (Hidden - Players will guess this)
              </label>
              <input
                type='text'
                id='middleWord'
                name='middleWord'
                value={formData.middleWord}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='e.g., ethrome'
              />
            </div>

            <div>
              <label
                htmlFor='bottomWord'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Bottom Word
              </label>
              <input
                type='text'
                id='bottomWord'
                name='bottomWord'
                value={formData.bottomWord}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='e.g., sleepless'
              />
            </div>

            <div>
              <label
                htmlFor='entryFee'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Entry Fee (ETH)
              </label>
              <input
                type='number'
                id='entryFee'
                name='entryFee'
                value={formData.entryFee}
                onChange={handleInputChange}
                required
                min='0.000000001'
                step='0.000000001'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Prize pool is funded from treasury (10x entry fee)
              </p>
            </div>

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h3 className='font-semibold text-blue-900 mb-2'>
                Game Preview:
              </h3>
              <div className='text-center space-y-2'>
                <div className='text-lg font-bold text-gray-900 bg-gray-100 py-2 px-4 rounded'>
                  {formData.topWord || 'TOP WORD'}
                </div>
                <div className='text-xl font-bold text-purple-600 bg-purple-100 py-3 px-4 rounded border-2 border-purple-300'>
                  {formData.middleWord
                    ? '•'.repeat(formData.middleWord.length)
                    : '••••••'}
                </div>
                <div className='text-lg font-bold text-gray-900 bg-gray-100 py-2 px-4 rounded'>
                  {formData.bottomWord || 'BOTTOM WORD'}
                </div>
              </div>
            </div>

            <button
              type='submit'
              disabled={isSubmitting || isLoading}
              className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isSubmitting || isLoading ? 'Creating Game...' : 'Create Game'}
            </button>
          </form>

          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='text-center space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <a
                  href='/admin/treasury'
                  className='inline-block bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors'
                >
                  💰 Treasury Management
                </a>
                <a
                  href='/admin/manage'
                  className='inline-block bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  👥 Manage Admins
                </a>
              </div>
              <div>
                <a
                  href='/'
                  className='text-purple-600 hover:text-purple-800 font-medium'
                >
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
