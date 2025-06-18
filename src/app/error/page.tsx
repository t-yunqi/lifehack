'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h1>
          
          <div className="text-gray-600 mb-6">
            {message && (
              <p className="mb-2">{message}</p>
            )}
            {error && (
              <p className="text-sm text-red-600">Error: {error}</p>
            )}
            {!message && !error && (
              <p>Invalid email or password. Please check your credentials and try again.</p>
            )}
          </div>

          <div className="space-y-3">
            <a
              href="/login"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-block text-center"
            >
              Try Again
            </a>
            
            <a
              href="/request-for-acc"
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded inline-block text-center"
            >
              Request Account Access
            </a>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>For technical support, contact your system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
}