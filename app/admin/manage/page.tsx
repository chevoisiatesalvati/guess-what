'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/use-contract';

export default function AdminManagePage() {
  const { address, isConnected } = useAccount();
  const { 
    isAdmin: checkIsAdmin, 
    isOwner: checkIsOwner, 
    addAdmin, 
    removeAdmin, 
    getAdminList, 
    getAdminCount,
    isLoading, 
    error 
  } = useContract();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [adminList, setAdminList] = useState<string[]>([]);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (address) {
        setCheckingAdmin(true);
        try {
          const [adminStatus, ownerStatus] = await Promise.all([
            checkIsAdmin(address),
            checkIsOwner(address)
          ]);
          setIsAdmin(adminStatus);
          setIsOwner(ownerStatus);
          console.log('👑 Admin status:', adminStatus, 'Owner status:', ownerStatus);
        } catch (error) {
          console.error('❌ Error checking admin status:', error);
          setIsAdmin(false);
          setIsOwner(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setIsOwner(false);
      }
    };

    checkAdminStatus();
  }, [address, checkIsAdmin, checkIsOwner]);

  // Load admin list
  useEffect(() => {
    const loadAdminList = async () => {
      if (isAdmin || isOwner) {
        try {
          const admins = await getAdminList();
          setAdminList(admins);
        } catch (error) {
          console.error('❌ Error loading admin list:', error);
        }
      }
    };

    loadAdminList();
  }, [isAdmin, isOwner, getAdminList]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminAddress.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await addAdmin(newAdminAddress);
      setSuccessMessage(`Admin ${newAdminAddress} added successfully!`);
      setNewAdminAddress('');
      
      // Reload admin list
      const admins = await getAdminList();
      setAdminList(admins);
    } catch (err: any) {
      console.error('❌ Error adding admin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    if (!confirm(`Are you sure you want to remove admin ${adminAddress}?`)) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await removeAdmin(adminAddress);
      setSuccessMessage(`Admin ${adminAddress} removed successfully!`);
      
      // Reload admin list
      const admins = await getAdminList();
      setAdminList(admins);
    } catch (err: any) {
      console.error('❌ Error removing admin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600">Please connect your wallet to access the admin management panel.</p>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checking Admin Status</h1>
          <p className="text-gray-600">Verifying your admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have admin privileges.</p>
          <p className="text-sm text-gray-500 mt-2">
            Only admins or the contract owner can access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
            <p className="text-gray-600">Manage admin privileges for the game contract</p>
            {isOwner && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>👑 Contract Owner:</strong> You have full admin privileges
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800">
                <strong>Success:</strong> {successMessage}
              </div>
            </div>
          )}

          {/* Add Admin Form - Only for owners */}
          {isOwner && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Admin</h2>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label htmlFor="adminAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Address
                  </label>
                  <input
                    type="text"
                    id="adminAddress"
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0x..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting || isLoading ? 'Adding Admin...' : 'Add Admin'}
                </button>
              </form>
            </div>
          )}

          {/* Admin List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Admins ({adminList.length})
            </h2>
            
            {adminList.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                <p>No admins found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminList.map((adminAddress, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">A</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {adminAddress}
                        </div>
                        <div className="text-sm text-gray-500">
                          Admin #{index + 1}
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveAdmin(adminAddress)}
                        disabled={isSubmitting || isLoading}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back to Admin Panel */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <a
                href="/admin"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                ← Back to Admin Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
