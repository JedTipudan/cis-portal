export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default async function PerformancePage() {
  const supabase = await createClient()
  const [
    { data: performance },
    { data: kpi },
    { data: reading },
    { data: { user } }
  ] = await Promise.all([
    supabase.from('performance').select('*').order('grade_level').order('subject'),
    supabase.from('kpi').select('*').order('indicator'),
    supabase.from('reading_assessment').select('*').order('grade_level').order('assessment_type'),
    supabase.auth.getUser(),
  ])
  return (
    <PerformanceClient
      performance={performance || []}
      kpi={kpi || []}
      reading={reading || []}
      isAdmin={!!user}
    />
  )
}
