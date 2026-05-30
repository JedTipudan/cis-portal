export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: enrollment },
    { data: performance },
    { data: personnel },
    { data: facilities },
    { data: programs },
    { data: transparency },
    { data: achievements },
    { data: needs },
    { data: attendance },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('school_profile').select('*').single(),
    supabase.from('enrollment').select('*').order('id'),
    supabase.from('performance').select('*').order('mps', { ascending: false }),
    supabase.from('personnel').select('*'),
    supabase.from('facilities').select('*'),
    supabase.from('programs').select('*'),
    supabase.from('transparency').select('*'),
    supabase.from('achievements').select('*'),
    supabase.from('priority_needs').select('*').order('priority'),
    supabase.from('attendance').select('*').order('id'),
    supabase.auth.getUser(),
  ])

  return (
    <DashboardClient
      profile={profile}
      enrollment={enrollment || []}
      performance={performance || []}
      personnel={personnel || []}
      facilities={facilities || []}
      programs={programs || []}
      transparency={transparency || []}
      achievements={achievements || []}
      needs={needs || []}
      attendance={attendance || []}
      isAdmin={!!user}
    />
  )
}
