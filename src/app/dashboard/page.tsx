export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DashboardPageClient from '@/components/dashboard/DashboardPageClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <DashboardPageClient isAdmin={!!user} />
}
