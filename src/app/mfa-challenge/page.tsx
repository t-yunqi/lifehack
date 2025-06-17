'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client'

export default function MFAChallengePage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setMessage('');

    const factors = await supabase.auth.mfa.listFactors();

    if (!factors.data || !factors.data.totp || factors.data.totp.length === 0) {
      setMessage('No TOTP factor found for this user.');
      return;
    }

    const totpFactor = factors.data.totp[0];

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

    if (!challenge.data) {
      setMessage(challenge.error?.message ?? 'Challenge failed.');
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      setMessage(verify.error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Enter 2FA Code</h1>

      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Submit
      </button>

      {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
    </main>
  );
}
