'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import EnrollmentClient from '@/components/admin/EnrollmentClient'
import { sortEnrollment } from '@/lib/sortEnrollment'

export default function EnrollmentPageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [enrollment, setEnrollment] = useState<any[]>([])
  const [learnerProfile, setLearnerProfile] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchData() {
    setLoading(true)
    const [{ data: e }, { data: lp }] = await Promise.all([
      supabase.from('enrollment').select('*').eq('school_year', schoolYear),
      supabase.from('learner_profile').select('*').eq('school_year', schoolYear).order('id'),
    ])
    setEnrollment(sortEnrollment(e || []))
    setLearnerProfile(lp || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <EnrollmentClient enrollment={enrollment} learnerProfile={learnerProfile} isAdmin={isAdmin} schoolYear={schoolYear} onSaved={fetchData} />
}
