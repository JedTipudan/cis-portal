import { createClient } from '@/lib/supabase/server'
import AttendanceClient from '@/components/admin/AttendanceClient'

export default async function AttendancePage() {
  const supabase = await createClient()
  const [{ data: attendance }, { data: { user } }] = await Promise.all([
    supabase.from('attendance').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return <AttendanceClient attendance={attendance || []} isAdmin={!!user} />
}
