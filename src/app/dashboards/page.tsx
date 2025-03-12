'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createApiKey, deleteApiKey, updateApiKey, copyApiKey, viewApiKey } from '@/lib/api-handlers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { maskApiKey } from '@/lib/utils';

// Define a User type for better type safety
interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

// User Panel Component
function UserPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUserProfile() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    }
    
    getUserProfile();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-8">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">User Profile</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user?.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  userId: string;
  type?: string;
  usage?: number;
}

export default function Dashboards() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  
  // New state for the create modal
  const [newKeyName, setNewKeyName] = useState('');
  const [keyType, setKeyType] = useState<'production' | 'development'>('development');
  const [limitUsage, setLimitUsage] = useState(false);
  const [usageLimit, setUsageLimit] = useState('1000');

  const [viewingKeyId, setViewingKeyId] = useState<string | null>(null);
  const [fullApiKey, setFullApiKey] = useState<string | null>(null);
  const [loadingKeyView, setLoadingKeyView] = useState(false);

  // New state for importing API keys
  const [showImportForm, setShowImportForm] = useState(false);
  const [importKeyName, setImportKeyName] = useState('');
  const [importKeyValue, setImportKeyValue] = useState('');
  const [importKeyType, setImportKeyType] = useState<'production' | 'development'>('development');

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Fetch API keys from the server
  const fetchApiKeys = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/apikeys');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      // Add type and usage fields to match the requested design
      const enhancedData = data.map((key: ApiKey) => ({
        ...key,
        type: 'dev',
        usage: 0
      }));
      setApiKeys(enhancedData);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      setError('Failed to fetch API keys. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleHideKey = () => {
    setViewingKeyId(null);
    setFullApiKey(null);
  };

  // Reset create form state
  const resetCreateForm = () => {
    setNewKeyName('');
    setKeyType('development');
    setLimitUsage(false);
    setUsageLimit('1000');
    setShowCreateForm(false);
  };

  const handleCreateKey = async (name: string, type: 'production' | 'development', usageLimit: number | null) => {
    await createApiKey(name, type, usageLimit, setApiKeys, setIsSubmitting, resetCreateForm, setError);
  };

  const handleDeleteKey = async (id: string) => {
    await deleteApiKey(id, setApiKeys, setIsSubmitting, setError);
  };

  const handleUpdateKey = async (key: ApiKey) => {
    if (!key) return;
    await updateApiKey(key, setApiKeys, setIsSubmitting, setEditingKey, setError);
  };

  const handleCopyKey = async (id: string) => {
    await copyApiKey(id, setCopiedKeyId, setError);
  };

  const handleViewKey = async (id: string) => {
    await viewApiKey(id, setLoadingKeyView, setFullApiKey, setViewingKeyId, setError);
  };

  // Import an existing API key
  const handleImportKey = async () => {
    if (!importKeyName.trim() || !importKeyValue.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/apikeys/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: importKeyName,
          key: importKeyValue,
          type: importKeyType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const newKey = await response.json();
      // Add default type and usage
      newKey.type = importKeyType;
      newKey.usage = 0;
      // Mask the key before adding it to the state
      newKey.key = maskApiKey(newKey.key);
      
      setApiKeys([...apiKeys, newKey]);
      resetImportForm();
    } catch (err: unknown) {
      console.error('Failed to import API key:', err);
      setError(`Failed to import API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset import form state
  const resetImportForm = () => {
    setImportKeyName('');
    setImportKeyValue('');
    setImportKeyType('development');
    setShowImportForm(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      <div className="max-w-5xl mx-auto">
        <ToastContainer />
        {/* User Panel */}
        <UserPanel />

        {/* API Keys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">API Keys</h2>
              <div className="flex space-x-2 ml-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                  disabled={isSubmitting || showCreateForm}
                  title="Create new API key"
                >
                  <span className="text-xl">+</span>
                </button>
                <button
                  onClick={() => setShowImportForm(true)}
                  className="h-6 px-2 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs"
                  disabled={isSubmitting || showImportForm}
                  title="Import existing API key"
                >
                  Import
                </button>
                <Link
                  href="/playground"
                  className="h-6 px-2 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                >
                  API Playground
                </Link>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">Secure API key management for your applications</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-6">
              <p className="text-gray-500">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You havent created any API keys yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-gray-500 uppercase border-b dark:border-gray-700">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Options</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-4 py-3">
                        {editingKey?.id === key.id ? (
                          <input
                            type="text"
                            value={editingKey.name}
                            onChange={(e) =>
                              setEditingKey({ ...editingKey, name: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md"
                            disabled={isSubmitting}
                          />
                        ) : (
                          <span className="font-medium">{key.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {key.type || 'dev'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {key.usage || 0}
                      </td>
                      <td className="px-4 py-3">
                        {viewingKeyId === key.id && fullApiKey ? (
                          <div className="flex flex-col">
                            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm mb-1 break-all">
                              {fullApiKey}
                            </code>
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Visible for 30 seconds
                            </div>
                          </div>
                        ) : (
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                            {key.key}
                          </code>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingKey?.id === key.id ? (
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (editingKey) {
                                  handleUpdateKey(editingKey);
                                }
                              }}
                              disabled={!editingKey.name.trim() || isSubmitting}
                              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-4">
                            <button
                              title={viewingKeyId === key.id ? "Hide API Key" : "View API Key"}
                              className={`text-gray-600 hover:text-gray-800 disabled:opacity-50 ${viewingKeyId === key.id ? 'bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full' : ''}`}
                              disabled={isSubmitting || loadingKeyView}
                              onClick={() => viewingKeyId === key.id ? handleHideKey() : handleViewKey(key.id)}
                            >
                              {loadingKeyView && viewingKeyId === key.id ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                            <button
                              title="Copy API Key"
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={isSubmitting}
                              onClick={() => handleCopyKey(key.id)}
                            >
                              {copiedKeyId === key.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              )}
                            </button>
                            <button
                              title="Edit API Key"
                              onClick={() => setEditingKey(key)}
                              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              title="Delete API Key"
                              onClick={() => handleDeleteKey(key.id)}
                              className="text-gray-600 hover:text-red-600 disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create API Key Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
              <h2 className="text-xl font-bold mb-4 text-center">Create a new API key</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-5 text-center">
                Enter a name and limit for the new API key.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="keyName">
                  Key Name — A unique name to identify this key
                </label>
                <input 
                  type="text" 
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  placeholder="Key Name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Key Type — Choose the environment for this key
                </label>
                
                <div className="space-y-3">
                  <div 
                    className={`border rounded-md p-3 flex items-center ${
                      keyType === 'production' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => setKeyType('production')}
                  >
                    <div className="mr-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        keyType === 'production' ? 'bg-blue-500' : 'border border-gray-300 dark:border-gray-500'
                      }`}>
                        {keyType === 'production' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Production</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Rate limited to 1,000 requests/minute</div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-md p-3 flex items-center ${
                      keyType === 'development' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => setKeyType('development')}
                  >
                    <div className="mr-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        keyType === 'development' ? 'bg-blue-500' : 'border border-gray-300 dark:border-gray-500'
                      }`}>
                        {keyType === 'development' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Development</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Rate limited to 100 requests/minute</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="limitUsage" 
                    checked={limitUsage}
                    onChange={(e) => setLimitUsage(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="limitUsage" className="ml-2 text-sm font-medium">
                    Limit monthly usage*
                  </label>
                </div>
                
                {limitUsage && (
                  <div className="mt-3">
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      min="1"
                    />
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  * If the combined usage of all your keys exceeds your plans limit, all requests will be rejected.
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleCreateKey(newKeyName, keyType, limitUsage ? parseInt(usageLimit) : null)}
                  disabled={!newKeyName.trim() || isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={resetCreateForm}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import API Key Modal */}
        {showImportForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Import API Key</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="importKeyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="importKeyName"
                    value={importKeyName}
                    onChange={(e) => setImportKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="My Imported API Key"
                  />
                </div>
                
                <div>
                  <label htmlFor="importKeyValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    id="importKeyValue"
                    value={importKeyValue}
                    onChange={(e) => setImportKeyValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="sk_live_..."
                  />
                </div>
                
                <div>
                  <label htmlFor="importKeyType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    id="importKeyType"
                    value={importKeyType}
                    onChange={(e) => setImportKeyType(e.target.value as 'production' | 'development')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleImportKey}
                  disabled={!importKeyName.trim() || !importKeyValue.trim() || isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={resetImportForm}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 