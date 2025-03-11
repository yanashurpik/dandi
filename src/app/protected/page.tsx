'use client';

import Link from 'next/link';

export default function Protected() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
              <Link
                href="/playground"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                ← Back to Playground
              </Link>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Explore our API endpoints and learn how to integrate them into your application.
            </p>
          </div>

          <div className="space-y-8">
            {/* Authentication Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Authentication</h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Include your API key in the request headers:
                </p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                  {`Authorization: Bearer YOUR_API_KEY`}
                </pre>
              </div>
            </section>

            {/* Endpoints Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Endpoints</h2>
              
              {/* Example Endpoint */}
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">GET</span>
                    <code className="text-sm">/api/v1/data</code>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Retrieve data from the API.
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Parameters</h3>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">limit</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">number</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Number of items to return</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">offset</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">number</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Number of items to skip</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Rate Limits Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rate Limits</h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Development API keys: 100 requests per minute</li>
                  <li>Production API keys: 1,000 requests per minute</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 