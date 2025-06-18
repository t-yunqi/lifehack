'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client'; 
import { useRouter } from 'next/navigation';

export default function TOTPEnrollmentPage() {
  const [factorId, setFactorId] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const setupFirstTime2FA = async () => {
      try {
        // Check authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setMessage('Please log in first');
          router.push('/login');
          return;
        }

        setUserEmail(user.email || '');
        console.log('Setting up 2FA for doctor:', user.email);

        // Check for existing verified factors
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        
        if (!factorsError && factors?.totp) {
          const verifiedFactors = factors.totp.filter(factor => factor.status === 'verified');
          
          if (verifiedFactors.length > 0) {
            // Doctor already has 2FA set up, redirect to challenge
            console.log('Doctor already has 2FA configured');
            setMessage('✅ 2FA already configured. Redirecting...');
            setTimeout(() => {
              router.push('/mfa-challenge');
            }, 1500);
            return;
          }
        }

        // This is a new doctor's first time - enroll TOTP
        console.log('Enrolling new TOTP factor for doctor...');
        
        const { data, error } = await supabase.auth.mfa.enroll({ 
          factorType: 'totp',
          friendlyName: 'Doctor Authenticator'
        });

        if (error) {
          console.error('Enrollment error:', error);
          setMessage(`Setup failed: ${error.message}. Please contact IT support.`);
          setIsLoading(false);
          return;
        }

        console.log('Enrollment successful:', data);

        if (data && data.totp) {
          setFactorId(data.id);
          setQrSvg(data.totp.qr_code);
          setSecret(data.totp.secret);
          setMessage('');
          setIsLoading(false);
        } else {
          setMessage('Failed to generate QR code. Please contact IT support.');
          setIsLoading(false);
        }

      } catch (err) {
        console.error('Setup error:', err);
        setMessage('An unexpected error occurred. Please contact IT support.');
        setIsLoading(false);
      }
    };

    setupFirstTime2FA();
  }, [router]);

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setMessage('Please enter a 6-digit code from your authenticator app');
      return;
    }

    if (!factorId) {
      setMessage('Setup error. Please refresh and try again.');
      return;
    }

    try {
      setMessage('Verifying your code...');
      
      // Create challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId });

      if (!challenge.data) {
        setMessage('Verification failed. Please try again.');
        return;
      }

      // Verify the code
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) {
        setMessage(`Code incorrect: ${verify.error.message}`);
        setVerifyCode(''); // Clear for retry
      } else {
        setMessage('✅ 2FA successfully activated! Welcome to the system.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setMessage('Verification failed. Please try again.');
      setVerifyCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verifyCode.length === 6) {
      handleVerify();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <main className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Setting up your security</h2>
            <p className="text-gray-600">Preparing your two-factor authentication...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <main className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h1>
          <p className="text-gray-600">Welcome, {userEmail}</p>
          <p className="text-sm text-gray-500 mt-1">First-time login requires 2FA setup</p>
        </div>
        
        {qrSvg && (
          <>
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-center">Step 1: Install an Authenticator App</h3>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p className="mb-2">Download one of these apps on your phone:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Google Authenticator</li>
                  <li>Microsoft Authenticator</li>
                  <li>Authy</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-center">Step 2: Scan QR Code</h3>
              <div className="text-center">
                <div 
                  className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Open your authenticator app and scan this code
                </p>
              </div>
            </div>

            {secret && (
              <div className="mb-6 p-3 bg-gray-100 rounded border">
                <p className="text-xs text-gray-600 mb-1 text-center font-medium">
                  Can't scan? Enter this key manually:
                </p>
                <code className="text-sm break-all font-mono block text-center bg-white p-2 rounded border">
                  {secret}
                </code>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-center">Step 3: Enter Verification Code</h3>
              <input
                type="text"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                className="w-full p-4 border rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifyCode.length !== 6}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-lg"
            >
              {verifyCode.length === 6 ? 'Activate 2FA' : `Enter ${6 - verifyCode.length} more digits`}
            </button>
          </>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : message.includes('Redirecting') || message.includes('Verifying')
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Help section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Need help? Contact IT support at{' '}
            <a href="mailto:it@hospital.com" className="text-blue-600">
              it@hospital.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}