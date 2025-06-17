import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/login');
  }

  // Get MFA assurance level
  const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (!aal || aalError) {
    // Optionally handle the error or assume no MFA setup
    console.warn('Unable to retrieve AAL:', aalError?.message);
    // Optional: redirect('/login') or proceed anyway
  } else if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    redirect('/mfa-challenge');
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>This page is protected and only accessible after login.</p>
    </main>
  );
}
