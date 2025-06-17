// app/dashboard/actions.ts
'use server'

import { redirect } from 'next/navigation'

export async function search(formData: FormData) {
  const id = formData.get('id')?.toString()

  if (!id) {
    throw new Error('ID is required')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/patients/${id}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (res.ok) {
    // patient exists, redirect to dashboard page
    redirect(`/dashboard/${id}`)
  } else {
    // patient not found, redirect back with search error
    redirect(`/dashboard?error=notfound`)
  }
}
