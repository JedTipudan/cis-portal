export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import NutritionalPageClient from '@/components/admin/NutritionalPageClient'

export default async function NutritionalStatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <NutritionalPageClient isAdmin={!!user} />
}
