export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import EnrollmentClient from '@/components/admin/EnrollmentClient'
import { sortEnrollment } from '@/lib/sortEnrollment'

export default async function EnrollmentPage() {
  const supabase = await createClient()
  const [
    { data: enrollment },
    { data: learnerProfile },
    { data: { user } }
  ] = await Promise.all([
    supabase.from('enrollment').select('*'),
    supabase.from('learner_profile').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return (
    <EnrollmentClient
      enrollment={sortEnrollment(enrollment || [])}
      learnerProfile={learnerProfile || []}
      isAdmin={!!user}
    />
  )
}
