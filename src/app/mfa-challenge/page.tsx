'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client'

export default function MFAChallengePage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initChallenge = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setMessage('Please log in first');
          router.push('/login');
          return;
        }

        setUserEmail(user.email || '');

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

        if (factorsError) {
          console.error('Error getting factors:', factorsError);
          setMessage('Error accessing 2FA. Please try logging in again.');
          return;
        }

        console.log('Available factors:', factors);

        const verifiedTOTPFactor = factors?.totp?.find(factor => factor.status === 'verified');
        
        if (!verifiedTOTPFactor) {
          setMessage('No 2FA setup found. Redirecting to setup...');
          setTimeout(() => {
            router.push('/totp-enrollment');
          }, 2000);
          return;
        }

        setFactorId(verifiedTOTPFactor.id);
        setMessage('Enter the 6-digit code from your authenticator app');

      } catch (err) {
        console.error('Error initializing challenge:', err);
        setMessage('Error loading 2FA. Please try again.');
      }
    };

    initChallenge();
  }, [router]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    if (!factorId) {
      setMessage('2FA not properly initialized. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setMessage('Verifying your code...');

    try {
      console.log('Creating challenge for factor:', factorId);
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ 
        factorId 
      });

      if (challengeError) {
        console.error('Challenge error:', challengeError);
        setMessage(`Challenge failed: ${challengeError.message}`);
        setIsLoading(false);
        return;
      }

      if (!challengeData) {
        setMessage('Failed to create verification challenge');
        setIsLoading(false);
        return;
      }

      console.log('Challenge created successfully');

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: code
      });

      if (verifyError) {
        console.error('Verification error:', verifyError);
        setMessage(`Incorrect code. Please try again.`);
        setCode('');
        setIsLoading(false);
        return;
      }

      console.log('Verification successful');
      
      setMessage('✅ Verification successful! Redirecting...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Verification process error:', err);
      setMessage('An error occurred during verification. Please try again.');
      setCode('');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !isLoading) {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <main className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          {userEmail && (
            <p className="text-sm text-gray-600">Signed in as: {userEmail}</p>
          )}
        </div>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Open your authenticator app and enter the 6-digit verification code
          </p>
        </div>

        <input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyPress={handleKeyPress}
          className="w-full p-4 border rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
          maxLength={6}
          disabled={isLoading}
          autoFocus
        />

        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || isLoading}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-lg mb-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify Code'
          )}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-center text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : message.includes('Verifying') || message.includes('Redirecting')
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
}