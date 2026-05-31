export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { sortEnrollment } from '@/lib/sortEnrollment'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: enrollment },
    { data: performance },
    { data: kpi },
    { data: personnel },
    { data: facilities },
    { data: programs },
    { data: transparency },
    { data: achievements },
    { data: needs },
    { data: attendance },
    { data: learnerProfile },
    { data: otherFunds },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('school_profile').select('*').single(),
    supabase.from('enrollment').select('*').order('id'),
    supabase.from('performance').select('*').order('grade_level').order('subject'),
    supabase.from('kpi').select('*').order('indicator'),
    supabase.from('personnel').select('*'),
    supabase.from('facilities').select('*'),
    supabase.from('programs').select('*'),
    supabase.from('transparency').select('*'),
    supabase.from('achievements').select('*'),
    supabase.from('priority_needs').select('*').order('priority'),
    supabase.from('attendance').select('*').order('id'),
    supabase.from('learner_profile').select('*').order('id'),
    supabase.from('other_funds').select('*').order('id'),
    supabase.auth.getUser(),
  ])

  return (
    <DashboardClient
      profile={profile}
      enrollment={sortEnrollment(enrollment || [])}
      performance={performance || []}
      kpi={kpi || []}
      personnel={personnel || []}
      facilities={facilities || []  }
      programs={programs || []}
      transparency={transparency || []}
      achievements={achievements || []}
      needs={needs || []}
      attendance={attendance || []}
      learnerProfile={learnerProfile || []}
      otherFunds={otherFunds || []}
      isAdmin={!!user}
    />
  )
}
