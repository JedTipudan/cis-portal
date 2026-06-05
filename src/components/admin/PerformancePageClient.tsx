'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default function PerformancePageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [performance, setPerformance] = useState<any[]>([])
  const [kpi, setKpi] = useState<any[]>([])
  const [reading, setReading] = useState<any[]>([])
  const [philiri, setPhiliri] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('performance').select('*').eq('school_year', schoolYear).order('grade_level').order('subject'),
      supabase.from('kpi').select('*').eq('school_year', schoolYear).order('indicator'),
      supabase.from('reading_assessment').select('*').eq('school_year', schoolYear).order('grade_level').order('assessment_type'),
      supabase.from('philiri_assessment').select('*').eq('school_year', schoolYear).order('grade_level'),
    ]).then(([{ data: p }, { data: k }, { data: r }, { data: ph }]) => {
      setPerformance(p || [])
      setKpi(k || [])
      setReading(r || [])
      setPhiliri(ph || [])
      setLoading(false)
    })
  }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <PerformanceClient performance={performance} kpi={kpi} reading={reading} philiri={philiri} isAdmin={isAdmin} schoolYear={schoolYear} />
}
