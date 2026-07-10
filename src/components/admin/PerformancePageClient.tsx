'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import PerformanceClient from '@/components/admin/PerformanceClient'

export default function PerformancePageClient({ isAdmin }: { isAdmin: boolean }) {
  const { schoolYear } = useSchoolYear()
  const [performance, setPerformance] = useState<any[]>([])
  const [kpi, setKpi] = useState<any[]>([])
  const [crla, setCrla] = useState<any[]>([])
  const [philiri, setPhiliri] = useState<any[]>([])
  const [rma, setRma] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('performance').select('*').eq('school_year', schoolYear).order('grade_level').order('subject'),
      supabase.from('kpi').select('*').eq('school_year', schoolYear).order('indicator'),
      supabase.from('crla_assessment').select('*').eq('school_year', schoolYear).order('grade_level'),
      supabase.from('philiri_assessment').select('*').eq('school_year', schoolYear).order('grade_level'),
      supabase.from('reading_assessment').select('*').eq('school_year', schoolYear).eq('assessment_type', 'RMA').order('grade_level'),
    ]).then(([{ data: p }, { data: k }, { data: c }, { data: ph }, { data: r }]) => {
      setPerformance(p || [])
      setKpi(k || [])
      setCrla(c || [])
      setPhiliri(ph || [])
      setRma(r || [])
      setLoading(false)
    })
  }, [schoolYear])

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>

  return <PerformanceClient performance={performance} kpi={kpi} crla={crla} philiri={philiri} rma={rma} isAdmin={isAdmin} schoolYear={schoolYear} />
}
