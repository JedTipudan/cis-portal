import { createClient } from '@/lib/supabase/server'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default async function PerformancePage() {
  const supabase = await createClient()
  const [{ data: performance }, { data: { user } }] = await Promise.all([
    supabase.from('performance').select('*').order('mps', { ascending: false }),
    supabase.auth.getUser(),
  ])
  return <PerformanceClient performance={performance || []} isAdmin={!!user} />
}
