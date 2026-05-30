import { createClient } from '@/lib/supabase/server'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default async function PerformancePage() {
  const supabase = await createClient()
  const [{ data: performance }, { data: kpi }, { data: { user } }] = await Promise.all([
    supabase.from('performance').select('*').order('grade_level').order('subject'),
    supabase.from('kpi').select('*').order('indicator'),
    supabase.auth.getUser(),
  ])
  return <PerformanceClient performance={performance || []} kpi={kpi || []} isAdmin={!!user} />
}
