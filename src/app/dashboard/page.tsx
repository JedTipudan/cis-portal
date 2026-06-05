export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DashboardPageClient from '@/components/dashboard/DashboardPageClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from('school_profile').select('*').single(),
    supabase.auth.getUser(),
  ])
  return <DashboardPageClient profile={profile} isAdmin={!!user} />
}
