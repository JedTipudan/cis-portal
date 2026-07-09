'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { sortEnrollment } from '@/lib/sortEnrollment'

export default function DashboardPageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [data, setData] = useState<any>(null)
  const supabase = createClient()
  const schoolYearRef = useRef(schoolYear)

  async function fetchData(sy: string) {
    setData(null)
    const [
      { data: enrollment }, { data: performance }, { data: kpi },
      { data: personnel }, { data: facilities }, { data: programs },
      { data: transparency }, { data: achievements }, { data: needs },
      { data: attendance }, { data: learnerProfile }, { data: otherFunds },
      { data: mooeMonthly }, { data: programsMonthly }, { data: reading },
      { data: philiri }, { data: nutritional }, { data: profileRows },
    ] = await Promise.all([
      supabase.from('enrollment').select('*').eq('school_year', sy).order('id'),
      supabase.from('performance').select('*').eq('school_year', sy).order('grade_level').order('subject'),
      supabase.from('kpi').select('*').eq('school_year', sy).order('indicator'),
      supabase.from('personnel').select('*'),
      supabase.from('facilities').select('*'),
      supabase.from('programs').select('*'),
      supabase.from('transparency').select('*'),
      supabase.from('achievements').select('*'),
      supabase.from('priority_needs').select('*').order('priority'),
      supabase.from('attendance').select('*').eq('school_year', sy).order('id'),
      supabase.from('learner_profile').select('*').eq('school_year', sy).order('id'),
      supabase.from('other_funds').select('*').order('id'),
      supabase.from('mooe_monthly').select('*').order('id'),
      supabase.from('programs_monthly').select('*').order('id'),
      supabase.from('reading_assessment').select('*').eq('school_year', sy).order('grade_level'),
      supabase.from('philiri_assessment').select('*').eq('school_year', sy).order('grade_level'),
      supabase.from('nutritional_status').select('*').eq('school_year', sy).order('grade_level'),
      supabase.from('school_profile').select('*').single(),
    ])
    if (schoolYearRef.current !== sy) return // stale, discard
    setData({
      profile: profileRows,
      enrollment: sortEnrollment(enrollment || []),
      performance: performance || [],
      kpi: kpi || [],
      personnel: personnel || [],
      facilities: facilities || [],
      programs: programs || [],
      transparency: transparency || [],
      achievements: achievements || [],
      needs: needs || [],
      attendance: attendance || [],
      learnerProfile: learnerProfile || [],
      otherFunds: otherFunds || [],
      mooeMonthly: mooeMonthly || [],
      programsMonthly: programsMonthly || [],
      reading: reading || [],
      philiri: philiri || [],
      nutritional: nutritional || [],
    })
  }

  useEffect(() => {
    schoolYearRef.current = schoolYear
    fetchData(schoolYear)
  }, [schoolYear])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData(schoolYear)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [schoolYear])

  if (!data) return <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Loading...</div>

  return <DashboardClient {...data} isAdmin={isAdmin} />
}
