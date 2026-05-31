export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default async function PerformancePage() {
  const supabase = await createClient()
  const [
    { data: performance },
    { data: kpi },
    { data: reading },
    { data: philiri },
    { data: { user } }
  ] = await Promise.all([
    supabase.from('performance').select('*').order('grade_level').order('subject'),
    supabase.from('kpi').select('*').order('indicator'),
    supabase.from('reading_assessment').select('*').order('grade_level').order('assessment_type'),
    supabase.from('philiri_assessment').select('*').order('grade_level'),
    supabase.auth.getUser(),
  ])
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <PerformanceClient
        performance={performance || []}
        kpi={kpi || []}
        reading={reading || []}
        philiri={philiri || []}
        isAdmin={!!user}
      />
    </Suspense>
  )
}
