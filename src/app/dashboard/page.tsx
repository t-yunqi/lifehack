import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }  
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>This page is protected and only accessible after login.</p>
    </main>
  );
}