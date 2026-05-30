import { createClient } from '@/lib/supabase/server'
import ReportsClient from '@/components/admin/ReportsClient'

export default async function ReportsPage() {
  const supabase = await createClient()
  const [{ data: documents }, { data: { user } }] = await Promise.all([
    supabase.from('documents').select('*').order('uploaded_at', { ascending: false }),
    supabase.auth.getUser(),
  ])
  return <ReportsClient documents={documents || []} isAdmin={!!user} />
}
