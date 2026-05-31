export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import TransparencyClient from '@/components/admin/TransparencyClient'

export default async function TransparencyPage() {
  const supabase = await createClient()
  const [
    { data: transparency },
    { data: otherFunds },
    { data: { user } }
  ] = await Promise.all([
    supabase.from('transparency').select('*').order('id'),
    supabase.from('other_funds').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <TransparencyClient
        transparency={transparency || []}
        otherFunds={otherFunds || []}
        isAdmin={!!user}
      />
    </Suspense>
  )
}
