'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import AttendanceClient from '@/components/admin/AttendanceClient'

export default function AttendancePageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)
    supabase.from('attendance').select('*').eq('school_year', schoolYear).order('id')
      .then(({ data }) => { setAttendance(data || []); setLoading(false) })
  }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <AttendanceClient attendance={attendance} isAdmin={isAdmin} schoolYear={schoolYear} />
}
