'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import NutritionalClient from '@/components/admin/NutritionalClient'

export default function NutritionalPageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchData() {
    setLoading(true)
    const { data: d } = await supabase.from('nutritional_status').select('*').eq('school_year', schoolYear).order('grade_level')
    setData(d || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <NutritionalClient data={data} isAdmin={isAdmin} schoolYear={schoolYear} onSaved={fetchData} />
}
