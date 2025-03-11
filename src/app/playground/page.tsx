'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { showErrorToast } from '@/lib/toasts';
import 'react-toastify/dist/ReactToastify.css';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleValidateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      // If validation successful, redirect to protected page
      router.push('/protected');
    } catch (err) {
      showErrorToast('Invalid API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">API Playground</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter your API key to test the endpoints</p>
          </div>

          <form onSubmit={handleValidateKey} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isValidating}
              />
            </div>

            <button
              type="submit"
              disabled={!apiKey.trim() || isValidating}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 