import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'

import { search } from './actions'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>This page is protected and only accessible after login. Please input the NRIC/FIN number of your patient:</p>

      <form>
        <div className="mb-6">
          <input name="id" type="text" className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
        </div>

        <div>
          <button
            formAction={search}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
          >
            Search
          </button>
        </div>
      </form>
    </main>
  );
}