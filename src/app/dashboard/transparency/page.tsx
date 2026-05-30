import { createClient } from '@/lib/supabase/server'
import TransparencyClient from '@/components/admin/TransparencyClient'

export default async function TransparencyPage() {
  const supabase = await createClient()
  const [{ data: transparency }, { data: { user } }] = await Promise.all([
    supabase.from('transparency').select('*').order('id'),
    supabase.auth.getUser(),
  ])
  return <TransparencyClient transparency={transparency || []} isAdmin={!!user} />
}
