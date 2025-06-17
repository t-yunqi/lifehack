import { supabase } from '@/utils/supabase/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { doctorId, patientId, action, reason } = req.body

  const { data, error } = await supabase.from('audit_logs').insert({
    doctor_id: doctorId,
    patient_id: patientId,
    action: action,
    reason: reason
  })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
