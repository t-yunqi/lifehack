import { supabase } from '@/utils/supabase/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id
  const reason = req.query.reason as string || `no reason inputted`
  const doctorId = req.headers['x-user-id'] || null

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('patients')
      .select()
      .eq('id', id)

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: doctorId,
        patientId: id,
        action: 'read',
        reason: reason
      })
    })

    if (error) return res.status(500).json({ error: error.message })
    if (!data) {
      return res.status(404).json({ error: 'Patient not found' })
    }
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    const updates = req.body
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: doctorId,
        patientId: id,
        action: 'write',
        reason: reason
      })
    })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
