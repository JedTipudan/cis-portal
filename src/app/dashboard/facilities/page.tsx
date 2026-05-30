import { createClient } from '@/lib/supabase/server'
import FacilitiesClient from '@/components/admin/FacilitiesClient'

export default async function FacilitiesPage() {
  const supabase = await createClient()
  const [{ data: facilities }, { data: { user } }] = await Promise.all([
    supabase.from('facilities').select('*'),
    supabase.auth.getUser(),
  ])
  return <FacilitiesClient facilities={facilities || []} isAdmin={!!user} />
}
