'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import {
  Pencil, Save, X, TrendingUp, Users, UserCheck,
  GraduationCap, BookOpen, UserX, RefreshCw, UserMinus, ArrowRightLeft
} from 'lucide-react'
import { useSchoolYear, getTermsOrQuarters, isTermBased } from '@/lib/SchoolYearContext'

const GRADE_LEVELS = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']
const PHILIRI_GRADES = ['Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']
const READING_PERIODS = ['BoSy','MoSY','EoSY']

// CRLA
const CRLA_GRADES = ['Grade 1','Grade 2','Grade 3']
const CRLA_LEVELS = ['Low Emerging Reader','High Emerging Reader','Developing Reader','Transition Reader','Reading at Grade Level']
const CRLA_FIELDS = ['low_emerging','high_emerging','developing','transition','grade_level_reader']
const CRLA_COLORS: Record<string,string> = {
  'Low Emerging Reader':'#EF4444','High Emerging Reader':'#F97316',
  'Developing Reader':'#F59E0B','Transition Reader':'#3B82F6','Reading at Grade Level':'#7C9A6E',
}

// RMA
const RMA_LEVELS = ['Emerging (Not Proficient)','Emerging (Low Proficient)','Developing (Nearly Proficient)','Transitioning (Proficient)','At Grade Level (Highly Proficient)']
const RMA_FIELDS = ['not_proficient','low_proficient','nearly_proficient','proficient','highly_proficient']
const RMA_COLORS: Record<string,string> = {
  'Emerging (Not Proficient)':'#EF4444','Emerging (Low Proficient)':'#F97316',
  'Developing (Nearly Proficient)':'#F59E0B','Transitioning (Proficient)':'#3B82F6',
  'At Grade Level (Highly Proficient)':'#7C9A6E',
}

// Phil-IRI sub-categories
const PHILIRI_SUBCATS: {key:string;label:string;fields:string[];levels:string[];colors:Record<string,string>}[] = [
  { key: 'overall',  label: 'Overall Percentage',       fields: ['three_levels_down','two_levels_down','grade_ready'],                 levels: ['3-Levels Down','2-Levels Down','Grade Ready'],  colors: {'3-Levels Down':'#EF4444','2-Levels Down':'#F59E0B','Grade Ready':'#7C9A6E'} as Record<string,string> },
  { key: 'tld_fil',  label: '3-Levels Down in Filipino', fields: ['tld_fil_frustration','tld_fil_instructional','tld_fil_independent'], levels: ['Frustration','Instructional','Independent'],    colors: {'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'} as Record<string,string> },
  { key: 'tld_eng',  label: '3-Levels Down in English',  fields: ['tld_eng_frustration','tld_eng_instructional','tld_eng_independent'], levels: ['Frustration','Instructional','Independent'],    colors: {'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'} as Record<string,string> },
  { key: 'twd_fil',  label: '2-Levels Down in Filipino', fields: ['twd_fil_frustration','twd_fil_instructional','twd_fil_independent'], levels: ['Frustration','Instructional','Independent'],    colors: {'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'} as Record<string,string> },
  { key: 'twd_eng',  label: '2-Levels Down in English',  fields: ['twd_eng_frustration','twd_eng_instructional','twd_eng_independent'], levels: ['Frustration','Instructional','Independent'],    colors: {'Frustration':'#EF4444','Instructional':'#3B82F6','Independent':'#7C9A6E'} as Record<string,string> },
]

const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate','Repetition Rate'])
const KPI_META: Record<string,{icon:any;desc:string;color:string}> = {
  'Enrollment Rate':            {icon:Users,         desc:'Learners enrolled vs. school-age population',  color:'#3B82F6'},
  'Participation Rate':         {icon:UserCheck,     desc:'Active learners attending school',             color:'#8B5CF6'},
  'Cohort Survival Rate':       {icon:TrendingUp,    desc:'Learners reaching final grade of a cycle',     color:'#7C9A6E'},
  'Completion Rate':            {icon:BookOpen,      desc:'Learners completing the full school cycle',    color:'#7C9A6E'},
  'Promotion Rate':             {icon:GraduationCap, desc:'Learners promoted to the next grade level',    color:'#7C9A6E'},
  'Graduation Rate':            {icon:GraduationCap, desc:'Learners graduating from the program',         color:'#7C9A6E'},
  'Dropout/School Leaver Rate': {icon:UserX,         desc:'Learners who left school before completion',   color:'#EF4444'},
  'Repetition Rate':            {icon:RefreshCw,     desc:'Learners repeating the same grade level',      color:'#F59E0B'},
  'Retention Rate':             {icon:UserMinus,     desc:'Learners retained from previous school year',  color:'#7C9A6E'},
  'Transition Rate':            {icon:ArrowRightLeft,desc:'Learners moving to the next education level',  color:'#3B82F6'},
}

function kpiStatus(indicator: string, value: number) {
  if (NEGATIVE_KPIS.has(indicator)) {
    if (value <= 1) return {label:'Excellent',cls:'bg-green-100 text-green-700'}
    if (value <= 3) return {label:'Acceptable',cls:'bg-yellow-100 text-yellow-700'}
    return {label:'Critical',cls:'bg-red-100 text-red-700'}
  }
  if (value >= 95) return {label:'Excellent',cls:'bg-green-100 text-green-700'}
  if (value >= 85) return {label:'Good',cls:'bg-blue-100 text-blue-700'}
  if (value >= 75) return {label:'Fair',cls:'bg-yellow-100 text-yellow-700'}
  return {label:'Needs Attention',cls:'bg-red-100 text-red-700'}
}

function ReadingTable({ data, fields, levels, colors, editing, onUpdate, grades }: {
  data: any[]; fields: string[]; levels: string[]; colors: Record<string,string>;
  editing: boolean; onUpdate: (id:string,f:string,v:string)=>void; grades: string[]
}) {
  const sorted = grades.map(g => data.find(r => r.grade_level === g)).filter(Boolean)
  const totals = fields.map(f => sorted.reduce((s,r) => s + Number(r[f]||0), 0))
  const grandTotal = totals.reduce((s,v) => s+v, 0)

  const chartData = sorted.map(r => {
    const obj: any = { name: r.grade_level.replace('Grade ','G') }
    fields.forEach((f,i) => { obj[levels[i]] = Number(r[f]||0) })
    return obj
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 mb-1">
        {levels.map(l => (
          <div key={l} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: colors[l]}} />
            <span className="text-gray-600">{l}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap">Grade</th>
              {levels.map(l => <th key={l} className="px-3 py-2 text-center text-xs whitespace-nowrap">{l}</th>)}
              <th className="px-3 py-2 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r,i) => {
              const rowTotal = fields.reduce((s,f) => s + Number(r[f]||0), 0)
              return (
                <tr key={r.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.grade_level}</td>
                  {fields.map((f,fi) => (
                    <td key={f} className="px-3 py-2 text-center">
                      {editing ? (
                        <input type="number" className="w-14 border rounded px-1 text-center text-xs"
                          value={r[f]||0} onChange={e => onUpdate(r.id, f, e.target.value)} />
                      ) : (
                        <span className="font-semibold" style={{color: colors[levels[fi]]}}>{r[f]||0}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold">{rowTotal}</td>
                </tr>
              )
            })}
            <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
              <td className="px-3 py-2">TOTAL</td>
              {totals.map((t,i) => <td key={i} className="px-3 py-2 text-center" style={{color:colors[levels[i]]}}>{t}</td>)}
              <td className="px-3 py-2 text-center">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl border p-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{top:5,right:10,left:-10,bottom:5}}>
            <XAxis dataKey="name" tick={{fontSize:10}} />
            <YAxis tick={{fontSize:10}} />
            <Tooltip />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {levels.map((l,i) => (
              <Bar key={l} dataKey={l} stackId="a" fill={colors[l]}
                radius={i===levels.length-1?[3,3,0,0]:[0,0,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function PerformanceClient({
  performance, kpi, reading, philiri, isAdmin, schoolYear = '2024-2025',
}: {
  performance: any[]; kpi: any[]; reading: any[]; philiri: any[]; isAdmin: boolean; schoolYear?: string
}) {
  const searchParams = useSearchParams()
  const { schoolYear: ctxSchoolYear } = useSchoolYear()
  const activeSchoolYear = schoolYear || ctxSchoolYear
  const TERMS = getTermsOrQuarters(activeSchoolYear)
  
  const [tab, setTab] = useState<'kpi'|'academic'|'reading'>('kpi')
  const [selectedGrade, setSelectedGrade] = useState('Grade 1')
  const [selectedAssessment, setSelectedAssessment] = useState<'CRLA'|'Phil-IRI'|'RMA'>('CRLA')
  const [philiriSubcat, setPhiliriSubcat] = useState('overall')
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0].value)
  const [selectedReadingPeriod, setSelectedReadingPeriod] = useState('BoSy')

  useEffect(() => {
    const t = searchParams.get('tab')
    const a = searchParams.get('assessment')
    if (t === 'kpi' || t === 'academic' || t === 'reading') setTab(t)
    if (a === 'CRLA' || a === 'Phil-IRI' || a === 'RMA') setSelectedAssessment(a)
  }, [searchParams])
  useEffect(() => {
    setSelectedTerm(TERMS[0].value)
  }, [activeSchoolYear])
  const [kpiRows, setKpiRows] = useState(kpi)
  const [perfRows, setPerfRows] = useState(performance)
  const [readingRows, setReadingRows] = useState(reading)
  const [philiriRows, setPhiliriRows] = useState(philiri)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const gradeSubjects = perfRows.filter(r => r.grade_level === selectedGrade && r.term === selectedTerm)
  const gradeMps = gradeSubjects.length
    ? (gradeSubjects.reduce((s,r) => s+Number(r.mps),0)/gradeSubjects.length).toFixed(1) : '0'

  const hasPerfDataForTerm = perfRows.some(r => r.term === selectedTerm)

  // CRLA / RMA data
  const crlaData = CRLA_GRADES.map(g => readingRows.find(r => r.assessment_type==='CRLA' && r.grade_level===g && r.reading_period === selectedReadingPeriod && r.term === selectedTerm)).filter(Boolean)
  const rmaData = GRADE_LEVELS.map(g => readingRows.find(r => r.assessment_type==='RMA' && r.grade_level===g && r.reading_period === selectedReadingPeriod && r.term === selectedTerm)).filter(Boolean)

  const currentSubcat = PHILIRI_SUBCATS.find(s => s.key === philiriSubcat)!

  async function save() {
    setSaving(true)
    if (tab==='kpi') {
      for (const r of kpiRows) await supabase.from('kpi').update({value:r.value}).eq('id',r.id)
    } else if (tab==='academic') {
      for (const r of gradeSubjects) await supabase.from('performance').update({mps:r.mps, term:selectedTerm}).eq('id',r.id)
    } else {
      if (selectedAssessment==='Phil-IRI') {
        for (const g of PHILIRI_GRADES) {
          const existing = philiriRows.find(r => r.grade_level===g && r.reading_period===selectedReadingPeriod && r.term===selectedTerm)
          if (existing) {
            const u: any = {}
            PHILIRI_SUBCATS.forEach(s => s.fields.forEach(f => { u[f]=existing[f] }))
            u.reading_period = selectedReadingPeriod
            u.term = selectedTerm
            await supabase.from('philiri_assessment').update(u).eq('id',existing.id)
          } else {
            const row: any = { grade_level: g, reading_period: selectedReadingPeriod, term: selectedTerm }
            PHILIRI_SUBCATS.forEach(s => s.fields.forEach(f => { row[f]=0 }))
            await supabase.from('philiri_assessment').insert(row)
          }
        }
      } else {
        const grades = selectedAssessment==='CRLA' ? CRLA_GRADES : GRADE_LEVELS
        const fields = selectedAssessment==='CRLA' ? CRLA_FIELDS : RMA_FIELDS
        for (const g of grades) {
          const existing = readingRows.find(r => r.assessment_type===selectedAssessment && r.grade_level===g && r.reading_period===selectedReadingPeriod && r.term===selectedTerm)
          if (existing) {
            const u: any = { assessment_type: selectedAssessment }
            fields.forEach(f => { u[f]=existing[f] })
            u.reading_period = selectedReadingPeriod
            u.term = selectedTerm
            await supabase.from('reading_assessment').update(u).eq('id',existing.id)
          } else {
            const row: any = { grade_level: g, assessment_type: selectedAssessment, reading_period: selectedReadingPeriod, term: selectedTerm }
            fields.forEach(f => { row[f]=0 })
            await supabase.from('reading_assessment').insert(row)
          }
        }
      }
    }
    setSaving(false)
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
    setKpiRows(kpi); setPerfRows(performance)
    setReadingRows(reading); setPhiliriRows(philiri)
  }

  const updateReading = (id:string,f:string,v:string) =>
    setReadingRows(readingRows.map(r => r.id===id ? {...r,[f]:v} : r))
  const updatePhiliri = (id:string,f:string,v:string) =>
    setPhiliriRows(philiriRows.map(r => r.id===id ? {...r,[f]:v} : r))

  async function initData() {
    setSaving(true)
    if (selectedAssessment === 'Phil-IRI') {
      const toInsert = PHILIRI_GRADES.map(g => {
        const row: any = { grade_level: g, reading_period: selectedReadingPeriod, term: selectedTerm }
        PHILIRI_SUBCATS.forEach(s => s.fields.forEach(f => { row[f] = 0 }))
        return row
      })
      const { data } = await supabase.from('philiri_assessment').insert(toInsert).select()
      if (data) setPhiliriRows([...philiriRows, ...data])
    } else {
      const grades = selectedAssessment === 'CRLA' ? CRLA_GRADES : GRADE_LEVELS
      const fields = selectedAssessment === 'CRLA' ? CRLA_FIELDS : RMA_FIELDS
      const toInsert = grades.map(g => {
        const row: any = { grade_level: g, assessment_type: selectedAssessment, reading_period: selectedReadingPeriod, term: selectedTerm }
        fields.forEach(f => { row[f] = 0 })
        return row
      })
      const { data } = await supabase.from('reading_assessment').insert(toInsert).select()
      if (data) setReadingRows([...readingRows, ...data])
    }
    setSaving(false)
    setEditing(true)
  }

  async function initKpi() {
    setSaving(true)
    const indicators = Object.keys(KPI_META)
    const toInsert = indicators.map(indicator => ({ indicator, value: 0, school_year: schoolYear }))
    const { data } = await supabase.from('kpi').insert(toInsert).select()
    if (data) setKpiRows([...kpiRows, ...data])
    setSaving(false)
    setEditing(true)
  }

  async function initPerformance() {
    setSaving(true)
    const subjects = [...new Set(perfRows.map(r => r.subject))]
    if (subjects.length === 0) {
      subjects.push('Math', 'English', 'Science', 'Filipino', 'Araling Panlipunan', 'MAPEH', 'EPP/TLE', 'Values Education')
    }
    const toInsert: any[] = []
    for (const g of GRADE_LEVELS) {
      for (const s of subjects) {
        toInsert.push({ grade_level: g, subject: s, mps: 0, term: selectedTerm })
      }
    }
    const { data } = await supabase.from('performance').insert(toInsert).select()
    if (data) setPerfRows([...perfRows, ...data])
    setSaving(false)
    setEditing(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
          <p className="text-gray-500 text-sm">School Year {schoolYear}</p>
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a7a52]">
            <Pencil size={14}/> Edit
          </button>
        )}
        {isAdmin && editing && (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm">
              <Save size={14}/> {saving?'Saving...':'Save'}
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14}/> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {[{key:'kpi',label:'Key Performance Indicators'},{key:'academic',label:'Academic Performance'},{key:'reading',label:'Literacy and Numeracy'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${tab===t.key?'bg-white shadow text-[#7C9A6E]':'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── KPI TAB ── */}
      {tab==='kpi' && (
        <div className="space-y-5">
          {isAdmin && kpiRows.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-700">No KPI data for <strong>{schoolYear}</strong>. Create rows to start entering data.</p>
              <button onClick={initKpi} disabled={saving}
                className="ml-4 px-4 py-2 bg-[#7C9A6E] text-white rounded-lg text-sm font-medium hover:bg-[#5a7a52] disabled:opacity-50 whitespace-nowrap">
                {saving ? 'Creating...' : 'Create Data'}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiRows.map(r => {
              const meta = KPI_META[r.indicator] ?? {icon:TrendingUp,desc:'',color:'#6B7280'}
              const Icon = meta.icon
              const isNeg = NEGATIVE_KPIS.has(r.indicator)
              const val = Number(r.value)
              const status = kpiStatus(r.indicator, val)
              const vc = isNeg?(val<=2?'#7C9A6E':'#EF4444'):(val>=90?'#7C9A6E':val>=75?'#3B82F6':'#EF4444')
              return (
                <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor:`${meta.color}18`}}>
                    <Icon size={18} style={{color:meta.color}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{r.indicator}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">{meta.desc}</p>
                    {editing ? (
                      <input type="number" step="0.1" className="w-20 border rounded px-2 py-0.5 text-sm font-bold"
                        value={r.value} onChange={e => setKpiRows(kpiRows.map(x => x.id===r.id?{...x,value:e.target.value}:x))}/>
                    ) : <p className="text-2xl font-bold" style={{color:vc}}>{r.value}%</p>}
                    {!isNeg && <div className="mt-2 bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{width:`${Math.min(val,100)}%`,backgroundColor:vc}}/></div>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-4">KPI Summary Chart</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiRows.map(r=>({name:r.indicator,value:Number(r.value)}))} layout="vertical" margin={{left:180,right:40}}>
                <XAxis type="number" domain={[0,100]} tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10}} width={180}/>
                <Tooltip formatter={(v:any)=>`${v}%`}/>
                <Bar dataKey="value" radius={[0,4,4,0]} label={{position:'right',fontSize:10,formatter:(v:any)=>`${v}%`}}>
                  {kpiRows.map((r,i) => {
                    const isNeg=NEGATIVE_KPIS.has(r.indicator); const val=Number(r.value)
                    return <Cell key={i} fill={isNeg?(val<=2?'#7C9A6E':'#EF4444'):(val>=90?'#7C9A6E':val>=75?'#3B82F6':'#EF4444')}/>
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ACADEMIC TAB ── */}
      {tab==='academic' && (
        <div className="space-y-4">
          {/* Term Selector */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">{isTermBased(activeSchoolYear) ? 'Term:' : 'Quarter:'}</span>
            {TERMS.map(t => (
              <button key={t.value} onClick={() => setSelectedTerm(t.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTerm===t.value?'bg-[#7C9A6E] text-white border-[#7C9A6E]':'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {/* No data banner for academic */}
          {isAdmin && !hasPerfDataForTerm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-yellow-700">No performance data for <strong>{selectedTerm}</strong>. Create empty rows to start entering data.</p>
              <button onClick={initPerformance} disabled={saving}
                className="ml-4 px-4 py-2 bg-[#7C9A6E] text-white rounded-lg text-sm font-medium hover:bg-[#5a7a52] disabled:opacity-50 whitespace-nowrap">
                {saving ? 'Creating...' : 'Create Data'}
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map(g => (
              <button key={g} onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedGrade===g?'bg-[#7C9A6E] text-white border-[#7C9A6E]':'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">MPS by Subject — {selectedGrade}</p>
              <p className="text-xs text-gray-400 mb-3">Overall MPS: <strong>{gradeMps}</strong></p>
              <ResponsiveContainer width="100%" height={Math.max(200,gradeSubjects.length*36)}>
                <BarChart data={gradeSubjects} layout="vertical" margin={{left:130,right:30}}>
                  <XAxis type="number" domain={[0,100]} tick={{fontSize:10}}/>
                  <YAxis type="category" dataKey="subject" tick={{fontSize:10}} width={130}/>
                  <Tooltip formatter={(v:any)=>`${v}%`}/>
                  <Bar dataKey="mps" radius={[0,4,4,0]} label={{position:'right',fontSize:10}}>
                    {gradeSubjects.map((_,i) => <Cell key={i} fill={Number(gradeSubjects[i].mps)>=85?'#7C9A6E':'#3B82F6'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#7C9A6E] text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-center">MPS</th>
                    <th className="px-4 py-2 text-center">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeSubjects.map((r,i) => (
                    <tr key={r.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                      <td className="px-4 py-2">{r.subject}</td>
                      <td className="px-4 py-2 text-center">
                        {editing ? (
                          <input type="number" step="0.1" className="w-20 border rounded px-1 text-center text-xs" value={r.mps}
                            onChange={e => setPerfRows(perfRows.map(x => x.id===r.id?{...x,mps:e.target.value}:x))}/>
                        ) : <span className="font-semibold">{r.mps}</span>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${Number(r.mps)>=85?'bg-green-100 text-green-700':Number(r.mps)>=75?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                          {Number(r.mps)>=85?'Mastered':Number(r.mps)>=75?'Nearing':'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F5C842]/20 font-bold">
                    <td className="px-4 py-2">OVERALL MPS</td>
                    <td className="px-4 py-2 text-center">{gradeMps}</td>
                    <td className="px-4 py-2 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── LITERACY AND NUMERACY TAB ── */}
      {tab==='reading' && (
        <div className="space-y-4">
          {/* Reading Period Selector */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">Period:</span>
            {READING_PERIODS.map(p => (
              <button key={p} onClick={() => setSelectedReadingPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedReadingPeriod===p?'bg-[#7C9A6E] text-white border-[#7C9A6E]':'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {p === 'BoSy' ? 'BoSy (Beginning of School Year)' : p === 'MoSY' ? 'MoSY (Middle of School Year)' : 'EoSY (End of School Year)'}
              </button>
            ))}
          </div>
          {/* Assessment selector */}
          <div className="flex flex-wrap gap-2">
            {(['CRLA','Phil-IRI','RMA'] as const).map(a => (
              <button key={a} onClick={() => setSelectedAssessment(a)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${selectedAssessment===a?'bg-[#7C9A6E] text-white border-[#7C9A6E]':'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {a}
                <span className="ml-1.5 text-xs font-normal opacity-70">
                  {a==='CRLA'?'(Gr.1–3)':a==='Phil-IRI'?'(Gr.4–10)':'(Gr.1–10)'}
                </span>
              </button>
            ))}
          </div>

          {/* No data banner */}
          {(() => {
            const noData = selectedAssessment === 'Phil-IRI'
              ? !philiriRows.some(r => r.reading_period === selectedReadingPeriod && r.term === selectedTerm)
              : !readingRows.some(r => r.assessment_type === selectedAssessment && r.reading_period === selectedReadingPeriod && r.term === selectedTerm)
            if (!noData || !isAdmin) return null
            return (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                <p className="text-sm text-yellow-700">No data for <strong>{selectedTerm}</strong> — <strong>{selectedReadingPeriod}</strong>. Create empty rows to start entering data.</p>
                <button onClick={initData} disabled={saving}
                  className="ml-4 px-4 py-2 bg-[#7C9A6E] text-white rounded-lg text-sm font-medium hover:bg-[#5a7a52] disabled:opacity-50 whitespace-nowrap">
                  {saving ? 'Creating...' : 'Create Data'}
                </button>
              </div>
            )
          })()}

          {/* CRLA */}
          {selectedAssessment==='CRLA' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>CRLA</strong> — Classroom Reading Level Assessment for Grades 1–3. Measures early reading fluency and comprehension.
              </div>
              <ReadingTable
                data={readingRows.filter(r => r.assessment_type==='CRLA' && r.reading_period === selectedReadingPeriod && r.term === selectedTerm)}
                fields={CRLA_FIELDS} levels={CRLA_LEVELS} colors={CRLA_COLORS}
                editing={editing} onUpdate={updateReading} grades={CRLA_GRADES}
              />
            </div>
          )}

          {/* Phil-IRI */}
          {selectedAssessment==='Phil-IRI' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>Phil-IRI</strong> — Philippine Informal Reading Inventory for Grades 4–10. DepEd standard tool for reading proficiency in Filipino & English.
              </div>

              {/* Sub-category tabs */}
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {PHILIRI_SUBCATS.map(s => (
                  <button key={s.key} onClick={() => setPhiliriSubcat(s.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${philiriSubcat===s.key?'bg-white shadow text-[#7C9A6E]':'text-gray-500 hover:text-gray-700'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <ReadingTable
                data={philiriRows.filter(r => r.reading_period === selectedReadingPeriod && r.term === selectedTerm)}
                fields={currentSubcat.fields}
                levels={currentSubcat.levels}
                colors={currentSubcat.colors}
                editing={editing}
                onUpdate={updatePhiliri}
                grades={PHILIRI_GRADES}
              />
            </div>
          )}

          {/* RMA */}
          {selectedAssessment==='RMA' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>RMA</strong> — Reading Miscue Analysis for Grades 1–10. Qualitative analysis of reading errors to guide targeted intervention.
              </div>
              <ReadingTable
                data={readingRows.filter(r => r.assessment_type==='RMA' && r.reading_period === selectedReadingPeriod && r.term === selectedTerm)}
                fields={RMA_FIELDS} levels={RMA_LEVELS} colors={RMA_COLORS}
                editing={editing} onUpdate={updateReading} grades={GRADE_LEVELS}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
