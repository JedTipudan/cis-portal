import { createClient } from '@/lib/supabase/server'
import EnrollmentClient from '@/components/admin/EnrollmentClient'

export default async function EnrollmentPage() {
  const supabase = await createClient()
  const [{ data: enrollment }, { data: { user } }] = await Promise.all([
    supabase.from('enrollment').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return <EnrollmentClient enrollment={enrollment || []} isAdmin={!!user} />
}
