'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client'; 

export default function TOTPEnrollmentPage() {
  const [factorId, setFactorId] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Enroll the user on mount
  useEffect(() => {
    const enroll = async () => {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });

      if (error) {
        setMessage(error.message);
        return;
      }

      setFactorId(data.id);
      setQrSvg(data.totp.qr_code); // SVG image
    };

    enroll();
  }, []);

  // Step 2: User enters code to verify setup
  const handleVerify = async () => {
    const challenge = await supabase.auth.mfa.challenge({ factorId });

    if (!challenge.data) {
      setMessage(challenge.error?.message ?? 'Challenge failed.');
      return;
    }

    const challengeId = challenge.data.id;

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: verifyCode,
    });

    if (verify.error) {
      setMessage(verify.error.message);
    } else {
      setMessage('✅ MFA successfully enabled!');
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Set up 2FA</h1>

      {qrSvg && (
        <div className="mb-4">
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`}
            alt="TOTP QR Code"
            className="mx-auto"
          />
        </div>
      )}

      <input
        type="text"
        placeholder="Enter 6-digit code"
        value={verifyCode}
        onChange={(e) => setVerifyCode(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <button
        onClick={handleVerify}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enable 2FA
      </button>

      {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
    </main>
  );
}
