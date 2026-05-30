import { createClient } from '@/lib/supabase/server'
import StakeholdersClient from '@/components/admin/StakeholdersClient'

export default async function StakeholdersPage() {
  const supabase = await createClient()
  const [{ data: stakeholders }, { data: { user } }] = await Promise.all([
    supabase.from('stakeholders').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return <StakeholdersClient stakeholders={stakeholders || []} isAdmin={!!user} />
}
