export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import PerformancePageClient from '@/components/admin/PerformancePageClient'

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <PerformancePageClient isAdmin={!!user} />
}
