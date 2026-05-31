'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  Pencil, Save, X, TrendingUp, TrendingDown, Users, UserCheck,
  GraduationCap, BookOpen, UserX, RefreshCw, UserMinus, ArrowRightLeft
} from 'lucide-react'

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
]

const READING_LEVELS = ['Independent', 'Instructional', 'Frustration', 'Non-Reader']
const ASSESSMENT_TYPES = ['CRLA', 'Phil-IRI', 'RMA']

const ASSESSMENT_INFO: Record<string, { desc: string; color: string }> = {
  'CRLA':     { desc: 'Classroom Reading Level Assessment — measures reading fluency and comprehension per grade level', color: '#7C9A6E' },
  'Phil-IRI': { desc: 'Philippine Informal Reading Inventory — DepEd standard tool for reading proficiency (Filipino & English)', color: '#3B82F6' },
  'RMA':      { desc: 'Reading Miscue Analysis — qualitative analysis of reading errors to guide intervention', color: '#8B5CF6' },
}

const LEVEL_COLORS: Record<string, string> = {
  'Independent':  '#7C9A6E',
  'Instructional':'#3B82F6',
  'Frustration':  '#F59E0B',
  'Non-Reader':   '#EF4444',
}

const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate', 'Repetition Rate'])

const KPI_META: Record<string, { icon: any; desc: string; color: string }> = {
  'Enrollment Rate':            { icon: Users,         desc: 'Learners enrolled vs. school-age population',    color: '#3B82F6' },
  'Participation Rate':         { icon: UserCheck,     desc: 'Active learners attending school',               color: '#8B5CF6' },
  'Cohort Survival Rate':       { icon: TrendingUp,    desc: 'Learners reaching final grade of a cycle',       color: '#7C9A6E' },
  'Completion Rate':            { icon: BookOpen,      desc: 'Learners completing the full school cycle',      color: '#7C9A6E' },
  'Promotion Rate':             { icon: GraduationCap, desc: 'Learners promoted to the next grade level',      color: '#7C9A6E' },
  'Graduation Rate':            { icon: GraduationCap, desc: 'Learners graduating from the program',           color: '#7C9A6E' },
  'Dropout/School Leaver Rate': { icon: UserX,         desc: 'Learners who left school before completion',     color: '#EF4444' },
  'Repetition Rate':            { icon: RefreshCw,     desc: 'Learners repeating the same grade level',        color: '#F59E0B' },
  'Retention Rate':             { icon: UserMinus,     desc: 'Learners retained from previous school year',    color: '#7C9A6E' },
  'Transition Rate':            { icon: ArrowRightLeft,desc: 'Learners moving to the next education level',    color: '#3B82F6' },
}

function kpiStatus(indicator: string, value: number) {
  if (NEGATIVE_KPIS.has(indicator)) {
    if (value <= 1) return { label: 'Excellent', cls: 'bg-green-100 text-green-700' }
    if (value <= 3) return { label: 'Acceptable', cls: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Critical', cls: 'bg-red-100 text-red-700' }
  }
  if (value >= 95) return { label: 'Excellent', cls: 'bg-green-100 text-green-700' }
  if (value >= 85) return { label: 'Good', cls: 'bg-blue-100 text-blue-700' }
  if (value >= 75) return { label: 'Fair', cls: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Needs Attention', cls: 'bg-red-100 text-red-700' }
}

export default function PerformanceClient({
  performance, kpi, reading, isAdmin,
}: {
  performance: any[]; kpi: any[]; reading: any[]; isAdmin: boolean
}) {
  const [tab, setTab] = useState<'kpi' | 'academic' | 'reading'>('kpi')
  const [selectedGrade, setSelectedGrade] = useState('Grade 1')
  const [selectedAssessment, setSelectedAssessment] = useState('Phil-IRI')
  const [kpiRows, setKpiRows] = useState(kpi)
  const [perfRows, setPerfRows] = useState(performance)
  const [readingRows, setReadingRows] = useState(reading)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const gradeSubjects = perfRows.filter(r => r.grade_level === selectedGrade)
  const gradeMps = gradeSubjects.length
    ? (gradeSubjects.reduce((s, r) => s + Number(r.mps), 0) / gradeSubjects.length).toFixed(1)
    : '0'

  // Reading data for selected assessment
  const assessmentData = readingRows.filter(r => r.assessment_type === selectedAssessment)

  async function save() {
    setSaving(true)
    if (tab === 'kpi') {
      for (const r of kpiRows) await supabase.from('kpi').update({ value: r.value }).eq('id', r.id)
    } else if (tab === 'academic') {
      for (const r of gradeSubjects) await supabase.from('performance').update({ mps: r.mps }).eq('id', r.id)
    } else {
      for (const r of assessmentData) {
        await supabase.from('reading_assessment').update({
          independent: r.independent, instructional: r.instructional,
          frustration: r.frustration, non_reader: r.non_reader
        }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
    setKpiRows(kpi)
    setPerfRows(performance)
    setReadingRows(reading)
  }

  const updateReading = (id: string, field: string, val: string) =>
    setReadingRows(readingRows.map(r => r.id === id ? { ...r, [field]: val } : r))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
          <p className="text-gray-500 text-sm">School Year 2024–2025</p>
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a7a52]">
            <Pencil size={14} /> Edit
          </button>
        )}
        {isAdmin && editing && (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'kpi', label: 'Key Performance Indicators' },
          { key: 'academic', label: 'Academic Performance' },
          { key: 'reading', label: 'Reading Assessment' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── KPI TAB ── */}
      {tab === 'kpi' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiRows.map((r) => {
              const meta = KPI_META[r.indicator] ?? { icon: TrendingUp, desc: '', color: '#6B7280' }
              const Icon = meta.icon
              const isNeg = NEGATIVE_KPIS.has(r.indicator)
              const val = Number(r.value)
              const status = kpiStatus(r.indicator, val)
              const valueColor = isNeg
                ? (val <= 2 ? '#7C9A6E' : '#EF4444')
                : (val >= 90 ? '#7C9A6E' : val >= 75 ? '#3B82F6' : '#EF4444')
              return (
                <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${meta.color}18` }}>
                    <Icon size={18} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{r.indicator}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2 leading-tight">{meta.desc}</p>
                    {editing ? (
                      <input type="number" step="0.1" className="w-20 border rounded px-2 py-0.5 text-sm font-bold"
                        value={r.value}
                        onChange={e => setKpiRows(kpiRows.map(x => x.id === r.id ? { ...x, value: e.target.value } : x))} />
                    ) : (
                      <p className="text-2xl font-bold" style={{ color: valueColor }}>{r.value}%</p>
                    )}
                    {!isNeg && (
                      <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(val, 100)}%`, backgroundColor: valueColor }} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-4">KPI Summary Chart</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiRows.map(r => ({ name: r.indicator, value: Number(r.value) }))} layout="vertical" margin={{ left: 180, right: 40 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={180} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: any) => `${v}%` }}>
                  {kpiRows.map((r, i) => {
                    const isNeg = NEGATIVE_KPIS.has(r.indicator)
                    const val = Number(r.value)
                    const fill = isNeg ? (val <= 2 ? '#7C9A6E' : '#EF4444') : (val >= 90 ? '#7C9A6E' : val >= 75 ? '#3B82F6' : '#EF4444')
                    return <Cell key={i} fill={fill} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ACADEMIC TAB ── */}
      {tab === 'academic' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map(g => (
              <button key={g} onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedGrade === g ? 'bg-[#7C9A6E] text-white border-[#7C9A6E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">MPS by Subject — {selectedGrade}</p>
              <p className="text-xs text-gray-400 mb-3">Overall MPS: <strong className="text-gray-700">{gradeMps}</strong></p>
              <ResponsiveContainer width="100%" height={Math.max(200, gradeSubjects.length * 36)}>
                <BarChart data={gradeSubjects} layout="vertical" margin={{ left: 130, right: 30 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="mps" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10 }}>
                    {gradeSubjects.map((r, i) => <Cell key={i} fill={Number(r.mps) >= 85 ? '#7C9A6E' : '#3B82F6'} />)}
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
                  {gradeSubjects.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2">{r.subject}</td>
                      <td className="px-4 py-2 text-center">
                        {editing ? (
                          <input type="number" step="0.1" className="w-20 border rounded px-1 text-center text-xs" value={r.mps}
                            onChange={e => setPerfRows(perfRows.map(x => x.id === r.id ? { ...x, mps: e.target.value } : x))} />
                        ) : <span className="font-semibold">{r.mps}</span>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${Number(r.mps) >= 85 ? 'bg-green-100 text-green-700' : Number(r.mps) >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {Number(r.mps) >= 85 ? 'Mastered' : Number(r.mps) >= 75 ? 'Nearing' : 'Low'}
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

      {/* ── READING ASSESSMENT TAB ── */}
      {tab === 'reading' && (
        <div className="space-y-4">
          {/* Assessment type selector */}
          <div className="flex flex-wrap gap-3">
            {ASSESSMENT_TYPES.map(a => (
              <button key={a} onClick={() => setSelectedAssessment(a)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${selectedAssessment === a ? 'bg-[#7C9A6E] text-white border-[#7C9A6E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {a}
              </button>
            ))}
          </div>

          {/* Assessment info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            <strong>{selectedAssessment}</strong> — {ASSESSMENT_INFO[selectedAssessment]?.desc}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {READING_LEVELS.map(l => (
              <div key={l} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LEVEL_COLORS[l] }} />
                <span className="text-gray-600">{l}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Grade Level</th>
                  <th className="px-4 py-2 text-center">Independent</th>
                  <th className="px-4 py-2 text-center">Instructional</th>
                  <th className="px-4 py-2 text-center">Frustration</th>
                  <th className="px-4 py-2 text-center">Non-Reader</th>
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {assessmentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No data yet. {isAdmin ? 'Click Edit to add data.' : 'Admin has not entered data yet.'}
                    </td>
                  </tr>
                ) : (
                  assessmentData.map((r, i) => {
                    const total = Number(r.independent) + Number(r.instructional) + Number(r.frustration) + Number(r.non_reader)
                    return (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 font-medium">{r.grade_level}</td>
                        {['independent', 'instructional', 'frustration', 'non_reader'].map(field => (
                          <td key={field} className="px-4 py-2 text-center">
                            {editing ? (
                              <input type="number" className="w-16 border rounded px-1 text-center text-xs"
                                value={r[field]}
                                onChange={e => updateReading(r.id, field, e.target.value)} />
                            ) : (
                              <span className="font-semibold" style={{ color: LEVEL_COLORS[field === 'non_reader' ? 'Non-Reader' : field.charAt(0).toUpperCase() + field.slice(1)] }}>
                                {r[field]}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center font-bold">{total}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bar chart summary */}
          {assessmentData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">{selectedAssessment} — Reading Level Distribution by Grade</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assessmentData.map(r => ({
                  name: r.grade_level.replace('Grade ', 'G'),
                  Independent: Number(r.independent),
                  Instructional: Number(r.instructional),
                  Frustration: Number(r.frustration),
                  'Non-Reader': Number(r.non_reader),
                }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {READING_LEVELS.map(l => (
                    <Bar key={l} dataKey={l} stackId="a" fill={LEVEL_COLORS[l]} radius={l === 'Non-Reader' ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
