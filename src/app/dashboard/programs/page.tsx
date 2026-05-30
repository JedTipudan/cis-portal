import { createClient } from '@/lib/supabase/server'
import ProgramsClient from '@/components/admin/ProgramsClient'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const [{ data: programs }, { data: { user } }] = await Promise.all([
    supabase.from('programs').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return <ProgramsClient programs={programs || []} isAdmin={!!user} />
}
