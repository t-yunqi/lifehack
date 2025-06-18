'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('Login attempt for:', data.email);

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Authentication failed';
    
    switch (error.message) {
      case 'Invalid login credentials':
        errorMessage = 'Invalid email or password';
        break;
      case 'Email not confirmed':
        errorMessage = 'Please confirm your email address';
        break;
      case 'Too many requests':
        errorMessage = 'Too many login attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    redirect(`/error?message=${encodeURIComponent(errorMessage)}&error=${encodeURIComponent(error.message)}`);
  }

  console.log('Login successful for user:', authData.user?.email);

  try {
    // Check MFA status
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      console.error('Error checking MFA factors:', factorsError);
      // If we can't check MFA status, proceed to enrollment to be safe
      redirect('/totp-enrollment');
      return;
    }

    console.log('User factors:', factors);

    // Check if user has any verified TOTP factors
    const verifiedTOTPFactors = factors?.totp?.filter(factor => factor.status === 'verified') || [];
    
    if (verifiedTOTPFactors.length > 0) {
      console.log('User has verified TOTP factors, redirecting to challenge');
      redirect('/mfa-challenge');
    } else {
      console.log('No verified TOTP factors found, redirecting to enrollment (first-time setup)');
      redirect('/totp-enrollment');
    }
  } catch (err) {
    console.error('Error in login flow:', err);
    // If anything fails, default to enrollment
    redirect('/totp-enrollment');
  }
}