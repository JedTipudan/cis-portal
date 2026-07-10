'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { Pencil, Save, X, TrendingUp, Users, UserCheck, GraduationCap, BookOpen, UserX, RefreshCw, UserMinus, ArrowRightLeft } from 'lucide-react'
import { useSchoolYear, getTermsOrQuarters, isTermBased } from '@/lib/SchoolYearContext'
import { GRADE_LEVELS, CRLA_GRADES, PHILIRI_GRADES, READING_PERIODS, CRLA_SUBCATS, PHILIRI_SUBCATS, RMA_SUBCATS, NEGATIVE_KPIS, kpiStatus, ReadingTable } from './PerformanceHelpers'

const KPI_META: Record<string,{icon:any;desc:string;color:string}> = {
  'Enrollment Rate':            {icon:Users,          desc:'Learners enrolled vs. school-age population', color:'#3B82F6'},
  'Participation Rate':         {icon:UserCheck,      desc:'Active learners attending school',            color:'#8B5CF6'},
  'Cohort Survival Rate':       {icon:TrendingUp,     desc:'Learners reaching final grade of a cycle',    color:'#7C9A6E'},
  'Completion Rate':            {icon:BookOpen,       desc:'Learners completing the full school cycle',   color:'#7C9A6E'},
  'Promotion Rate':             {icon:GraduationCap,  desc:'Learners promoted to the next grade level',   color:'#7C9A6E'},
  'Graduation Rate':            {icon:GraduationCap,  desc:'Learners graduating from the program',        color:'#7C9A6E'},
  'Dropout/School Leaver Rate': {icon:UserX,          desc:'Learners who left school before completion',  color:'#EF4444'},
  'Repetition Rate':            {icon:RefreshCw,      desc:'Learners repeating the same grade level',     color:'#F59E0B'},
  'Retention Rate':             {icon:UserMinus,      desc:'Learners retained from previous school year', color:'#7C9A6E'},
  'Transition Rate':            {icon:ArrowRightLeft, desc:'Learners moving to the next education level', color:'#3B82F6'},
}

export default function PerformanceClient({
  performance, kpi, crla, philiri, rma, isAdmin, schoolYear = '2024-2025',
}: {
  performance: any[]; kpi: any[]; crla: any[]; philiri: any[]; rma: any[]
  isAdmin: boolean; schoolYear?: string
}) {
  const searchParams = useSearchParams()
  const { schoolYear: ctxSY } = useSchoolYear()
  const activeSY = schoolYear || ctxSY
  const TERMS = getTermsOrQuarters(activeSY)

  const [tab, setTab]                           = useState<'kpi'|'academic'|'reading'>('kpi')
  const [selectedGrade, setSelectedGrade]       = useState('Grade 1')
  const [assessment, setAssessment]             = useState<'CRLA'|'Phil-IRI'|'RMA'>('CRLA')
  const [crlaSubcat, setCrlaSubcat]             = useState('overall')
  const [philiriSubcat, setPhiliriSubcat]       = useState('overall')
  const [rmaSubcat]                             = useState('overall')
  const [term, setTerm]                         = useState(TERMS[0].value)
  const [period, setPeriod]                     = useState('BoSy')

  const [kpiRows,   setKpiRows]   = useState(kpi)
  const [perfRows,  setPerfRows]  = useState(performance)
  const [crlaRows,  setCrlaRows]  = useState(crla)
  const [philiriRows, setPhiliriRows] = useState(philiri)
  const [rmaRows,   setRmaRows]   = useState(rma)
  const [editing,   setEditing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const t = searchParams.get('tab'), a = searchParams.get('assessment')
    if (t === 'kpi' || t === 'academic' || t === 'reading') setTab(t)
    if (a === 'CRLA' || a === 'Phil-IRI' || a === 'RMA') setAssessment(a)
  }, [searchParams])
  useEffect(() => { setTerm(TERMS[0].value) }, [activeSY])

  const gradeSubjects = perfRows.filter(r => r.grade_level === selectedGrade && r.term === term)
  const gradeMps = gradeSubjects.length ? (gradeSubjects.reduce((s,r) => s+Number(r.mps),0)/gradeSubjects.length).toFixed(1) : '0'
  const hasPerfData = perfRows.some(r => r.term === term)

  const filteredCrla    = crlaRows.filter(r => r.reading_period === period && r.term === term)
  const filteredPhiliri = philiriRows.filter(r => r.reading_period === period && r.term === term)
  const filteredRma     = rmaRows.filter(r => r.reading_period === period && r.term === term)

  const curCrla    = CRLA_SUBCATS.find(s => s.key === crlaSubcat)!
  const curPhiliri = PHILIRI_SUBCATS.find(s => s.key === philiriSubcat)!
  const curRma     = RMA_SUBCATS[0]

  function cancelEdit() {
    setEditing(false)
    setKpiRows(kpi); setPerfRows(performance)
    setCrlaRows(crla); setPhiliriRows(philiri); setRmaRows(rma)
  }

  async function save() {
    setSaving(true)
    if (tab === 'kpi') {
      for (const r of kpiRows) await supabase.from('kpi').update({value:r.value}).eq('id',r.id)
    } else if (tab === 'academic') {
      for (const r of gradeSubjects) await supabase.from('performance').update({mps:r.mps}).eq('id',r.id)
    } else {
      if (assessment === 'CRLA') {
        for (const r of filteredCrla) {
          const u: any = {}
          CRLA_SUBCATS.forEach(s => s.fields.forEach(f => { u[f] = r[f] }))
          await supabase.from('crla_assessment').update(u).eq('id', r.id)
        }
      } else if (assessment === 'Phil-IRI') {
        for (const r of filteredPhiliri) {
          const u: any = {}
          PHILIRI_SUBCATS.forEach(s => s.fields.forEach(f => { u[f] = r[f] }))
          await supabase.from('philiri_assessment').update(u).eq('id', r.id)
        }
      } else {
        for (const r of filteredRma) {
          const u: any = {}
          curRma.fields.forEach(f => { u[f] = r[f] })
          await supabase.from('reading_assessment').update(u).eq('id', r.id)
        }
      }
    }
    setSaving(false); setEditing(false)
  }

  async function initCrla() {
    setSaving(true)
    const toInsert = CRLA_GRADES.map(g => {
      const row: any = { grade_level: g, reading_period: period, term, school_year: activeSY }
      CRLA_SUBCATS.forEach(s => s.fields.forEach(f => { row[f] = 0 }))
      return row
    })
    const { data } = await supabase.from('crla_assessment').insert(toInsert).select()
    if (data) setCrlaRows([...crlaRows, ...data])
    setSaving(false); setEditing(true)
  }

  async function initPhiliri() {
    setSaving(true)
    const toInsert = PHILIRI_GRADES.map(g => {
      const row: any = { grade_level: g, reading_period: period, term, school_year: activeSY }
      PHILIRI_SUBCATS.forEach(s => s.fields.forEach(f => { row[f] = 0 }))
      return row
    })
    const { data } = await supabase.from('philiri_assessment').insert(toInsert).select()
    if (data) setPhiliriRows([...philiriRows, ...data])
    setSaving(false); setEditing(true)
  }

  async function initRma() {
    setSaving(true)
    const toInsert = GRADE_LEVELS.map(g => {
      const row: any = { grade_level: g, assessment_type: 'RMA', reading_period: period, term, school_year: activeSY }
      curRma.fields.forEach(f => { row[f] = 0 })
      return row
    })
    const { data } = await supabase.from('reading_assessment').insert(toInsert).select()
    if (data) setRmaRows([...rmaRows, ...data])
    setSaving(false); setEditing(true)
  }

  async function initPerformance() {
    setSaving(true)
    const subjects = [...new Set(perfRows.map(r => r.subject))] as string[]
    if (!subjects.length) subjects.push('Math','English','Science','Filipino','Araling Panlipunan','MAPEH','EPP/TLE','Values Education')
    const toInsert: any[] = []
    for (const g of GRADE_LEVELS) for (const s of subjects) toInsert.push({grade_level:g,subject:s,mps:0,term,school_year:activeSY})
    const { data } = await supabase.from('performance').insert(toInsert).select()
    if (data) setPerfRows([...perfRows, ...data])
    setSaving(false); setEditing(true)
  }

  async function initKpi() {
    setSaving(true)
    const toInsert = Object.keys(KPI_META).map(indicator => ({indicator,value:0,school_year:activeSY}))
    const { data } = await supabase.from('kpi').insert(toInsert).select()
    if (data) setKpiRows([...kpiRows, ...data])
    setSaving(false); setEditing(true)
  }

  const btnPill = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-[#7C9A6E] text-white border-[#7C9A6E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`
  const btnTab = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${active ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`
  const noDataBanner = (msg: string, onInit: () => void) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
      <p className="text-sm text-yellow-700">{msg}</p>
      <button onClick={onInit} disabled={saving} className="ml-4 px-4 py-2 bg-[#7C9A6E] text-white rounded-lg text-sm font-medium hover:bg-[#5a7a52] disabled:opacity-50 whitespace-nowrap">
        {saving ? 'Creating...' : 'Create Data'}
      </button>
    </div>
  )

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
              <Save size={14}/> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14}/> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {([{key:'kpi',label:'Key Performance Indicators'},{key:'academic',label:'Academic Performance'},{key:'reading',label:'Literacy and Numeracy'}] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={btnTab(tab===t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ── KPI ── */}
      {tab === 'kpi' && (
        <div className="space-y-5">
          {isAdmin && !kpiRows.length && noDataBanner(`No KPI data for ${schoolYear}.`, initKpi)}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiRows.map(r => {
              const meta = KPI_META[r.indicator] ?? {icon:TrendingUp,desc:'',color:'#6B7280'}
              const Icon = meta.icon
              const val = Number(r.value)
              const status = kpiStatus(r.indicator, val)
              const isNeg = NEGATIVE_KPIS.has(r.indicator)
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
                    {editing
                      ? <input type="number" step="0.1" className="w-20 border rounded px-2 py-0.5 text-sm font-bold" value={r.value} onChange={e => setKpiRows(kpiRows.map(x => x.id===r.id?{...x,value:e.target.value}:x))}/>
                      : <p className="text-2xl font-bold" style={{color:vc}}>{r.value}%</p>}
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
                    const isNeg=NEGATIVE_KPIS.has(r.indicator), val=Number(r.value)
                    return <Cell key={i} fill={isNeg?(val<=2?'#7C9A6E':'#EF4444'):(val>=90?'#7C9A6E':val>=75?'#3B82F6':'#EF4444')}/>
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ACADEMIC ── */}
      {tab === 'academic' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">{isTermBased(activeSY)?'Term:':'Quarter:'}</span>
            {TERMS.map(t => <button key={t.value} onClick={() => setTerm(t.value)} className={btnPill(term===t.value)}>{t.label}</button>)}
          </div>
          {isAdmin && !hasPerfData && noDataBanner(`No performance data for ${term}.`, initPerformance)}
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map(g => <button key={g} onClick={() => setSelectedGrade(g)} className={btnPill(selectedGrade===g)}>{g}</button>)}
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
                        {editing
                          ? <input type="number" step="0.1" className="w-20 border rounded px-1 text-center text-xs" value={r.mps} onChange={e => setPerfRows(perfRows.map(x => x.id===r.id?{...x,mps:e.target.value}:x))}/>
                          : <span className="font-semibold">{r.mps}</span>}
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

      {/* ── LITERACY & NUMERACY ── */}
      {tab === 'reading' && (
        <div className="space-y-4">
          {/* Period */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">Period:</span>
            {READING_PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={btnPill(period===p)}>
                {p==='BoSy'?'BoSy (Beginning of School Year)':p==='MoSY'?'MoSY (Middle of School Year)':'EoSY (End of School Year)'}
              </button>
            ))}
          </div>
          {/* Assessment */}
          <div className="flex flex-wrap gap-2">
            {([{key:'CRLA',grades:'Gr.1–3'},{key:'Phil-IRI',grades:'Gr.4–10'},{key:'RMA',grades:'Gr.1–10'}] as const).map(a => (
              <button key={a.key} onClick={() => setAssessment(a.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${assessment===a.key?'bg-[#7C9A6E] text-white border-[#7C9A6E]':'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {a.key} <span className="text-xs font-normal opacity-70">({a.grades})</span>
              </button>
            ))}
          </div>

          {/* CRLA */}
          {assessment === 'CRLA' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>CRLA</strong> — Comprehensive Rapid Literacy Assessment for Grades 1–3.
              </div>
              {isAdmin && !filteredCrla.length && noDataBanner(`No CRLA data for ${term} — ${period}.`, initCrla)}
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {CRLA_SUBCATS.map(s => <button key={s.key} onClick={() => setCrlaSubcat(s.key)} className={btnTab(crlaSubcat===s.key)}>{s.label}</button>)}
              </div>
              <ReadingTable
                data={filteredCrla} fields={curCrla.fields} levels={curCrla.levels} colors={curCrla.colors}
                editing={editing} onUpdate={(id,f,v) => setCrlaRows(crlaRows.map(r => r.id===id?{...r,[f]:v}:r))}
                grades={CRLA_GRADES}
              />
            </div>
          )}

          {/* Phil-IRI */}
          {assessment === 'Phil-IRI' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>Phil-IRI</strong> — Philippine Informal Reading Inventory for Grades 4–10.
              </div>
              {isAdmin && !filteredPhiliri.length && noDataBanner(`No Phil-IRI data for ${term} — ${period}.`, initPhiliri)}
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {PHILIRI_SUBCATS.map(s => <button key={s.key} onClick={() => setPhiliriSubcat(s.key)} className={btnTab(philiriSubcat===s.key)}>{s.label}</button>)}
              </div>
              <ReadingTable
                data={filteredPhiliri} fields={curPhiliri.fields} levels={curPhiliri.levels} colors={curPhiliri.colors}
                editing={editing} onUpdate={(id,f,v) => setPhiliriRows(philiriRows.map(r => r.id===id?{...r,[f]:v}:r))}
                grades={PHILIRI_GRADES}
              />
            </div>
          )}

          {/* RMA */}
          {assessment === 'RMA' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <strong>RMA</strong> — Rapid Math Assessment for Grades 1–10.
              </div>
              {isAdmin && !filteredRma.length && noDataBanner(`No RMA data for ${term} — ${period}.`, initRma)}
              <ReadingTable
                data={filteredRma} fields={curRma.fields} levels={curRma.levels} colors={curRma.colors}
                editing={editing} onUpdate={(id,f,v) => setRmaRows(rmaRows.map(r => r.id===id?{...r,[f]:v}:r))}
                grades={GRADE_LEVELS}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
