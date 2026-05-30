import { createClient } from '@/lib/supabase/server'
import PersonnelClient from '@/components/admin/PersonnelClient'

export default async function PersonnelPage() {
  const supabase = await createClient()
  const [{ data: personnel }, { data: { user } }] = await Promise.all([
    supabase.from('personnel').select('*'),
    supabase.auth.getUser(),
  ])
  return <PersonnelClient personnel={personnel || []} isAdmin={!!user} />
}
