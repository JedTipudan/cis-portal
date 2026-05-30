import { createClient } from '@/lib/supabase/server'
import SchoolProfileClient from '@/components/admin/SchoolProfileClient'

export default async function SchoolProfilePage() {
  const supabase = await createClient()
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from('school_profile').select('*').single(),
    supabase.auth.getUser(),
  ])
  return <SchoolProfileClient profile={profile} isAdmin={!!user} />
}
