'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboards');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboards');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Key Manager</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to manage your API keys</p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#1d4ed8',
                      inputBackground: 'white',
                      inputBorder: '#e5e7eb',
                      inputBorderFocus: '#3b82f6',
                      inputBorderHover: '#d1d5db',
                      inputText: '#1f2937',
                      inputPlaceholder: '#9ca3af',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0.375rem',
                      buttonBorderRadius: '0.375rem',
                      inputBorderRadius: '0.375rem',
                    },
                  },
                  dark: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#60a5fa',
                      inputBackground: '#374151',
                      inputBorder: '#4b5563',
                      inputBorderFocus: '#3b82f6',
                      inputBorderHover: '#6b7280',
                      inputText: '#f3f4f6',
                      inputPlaceholder: '#9ca3af',
                    },
                  },
                },
                className: {
                  button: 'w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  container: 'space-y-4',
                  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
                  input: 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm',
                  divider: 'my-6 border-t border-gray-200 dark:border-gray-700',
                  anchor: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
                },
              }}
              providers={['github']}
              redirectTo={`${window.location.origin}/auth/callback`}
            />
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Secure API key management for your applications
          </p>
        </div>
      </div>
    </div>
  );
}
