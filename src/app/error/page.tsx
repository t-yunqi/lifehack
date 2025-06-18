'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the client component to defer its loading
const ClientErrorDisplay = dynamic(() => import('./client-error-display'), { ssr: false })

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <Suspense fallback={<p className="text-center">Loading error details...</p>}>
          <ClientErrorDisplay />
        </Suspense>
      </div>
    </div>
  )
}
