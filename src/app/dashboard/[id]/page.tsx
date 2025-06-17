import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function PatientDashboard({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: auth, error } = await supabase.auth.getUser()
  if (error || !auth?.user) redirect('/login')

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/patients/${params.id}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!res.ok) notFound()

  const patient = await res.json()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <p>Patient ID: {params.id}</p>
      <pre className="mt-4 bg-gray-100 p-4 rounded-md">{JSON.stringify(patient, null, 2)}</pre>
    </main>
  )
}
