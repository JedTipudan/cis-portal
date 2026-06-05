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

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('enrollment').select('*').eq('school_year', schoolYear),
      supabase.from('learner_profile').select('*').eq('school_year', schoolYear).order('id'),
    ]).then(([{ data: e }, { data: lp }]) => {
      setEnrollment(sortEnrollment(e || []))
      setLearnerProfile(lp || [])
      setLoading(false)
    })
  }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <EnrollmentClient enrollment={enrollment} learnerProfile={learnerProfile} isAdmin={isAdmin} schoolYear={schoolYear} />
}
