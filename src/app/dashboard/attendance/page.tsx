export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import AttendancePageClient from '@/components/admin/AttendancePageClient'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <AttendancePageClient isAdmin={!!user} />
}
