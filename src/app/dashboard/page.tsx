import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('isLoggedIn');

  if (!isLoggedIn || isLoggedIn.value !== 'true') {
    redirect('/login');
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>This page is protected and only accessible after login.</p>
    </main>
  );
}