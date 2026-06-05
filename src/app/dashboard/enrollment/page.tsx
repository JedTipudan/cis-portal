export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import EnrollmentPageClient from '@/components/admin/EnrollmentPageClient'

export default async function EnrollmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <EnrollmentPageClient isAdmin={!!user} />
}
