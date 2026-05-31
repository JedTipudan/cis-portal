'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import {
  Pencil, Save, X, TrendingUp, Users, UserCheck,
  GraduationCap, BookOpen, UserX, RefreshCw, UserMinus, ArrowRightLeft
} from 'lucide-react'

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
]

// Grade ranges per assessment
const ASSESSMENT_GRADES: Record<string, string[]> = {
  'CRLA':     ['Grade 1', 'Grade 2', 'Grade 3'],
  'Phil-IRI': ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  'RMA':      ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
}

// Levels per assessment (ordered lowest to highest)
const ASSESSMENT_LEVELS: Record<string, string[]> = {
  'CRLA': [
    'Low Emerging Reader',
    'High Emerging Reader',
    'Developing Reader',
    'Transition Reader',
    'Reading at Grade Level',
  ],
  'Phil-IRI': [
    'Frustration',
    'Instructional',
    'Independent',
  ],
  'RMA': [
    'Emerging (Not Proficient)',
    'Emerging (Low Proficient)',
    'Developing (Nearly Proficient)',
    'Transitioning (Proficient)',
    'At Grade Level (Highly Proficient)',
  ],
}

const LEVEL_COLORS_CRLA: Record<string, string> = {
  'Low Emerging Reader':      '#EF4444',
  'High Emerging Reader':     '#F97316',
  'Developing Reader':        '#F59E0B',
  'Transition Reader':        '#3B82F6',
  'Reading at Grade Level':   '#7C9A6E',
}

const LEVEL_COLORS_PHILIRI: Record<string, string> = {
  'Frustration':   '#EF4444',
  'Instructional': '#3B82F6',
  'Independent':   '#7C9A6E',
}

const LEVEL_COLORS_RMA: Record<string, string> = {
  'Emerging (Not Proficient)':          '#EF4444',
  'Emerging (Low Proficient)':          '#F97316',
  'Developing (Nearly Proficient)':     '#F59E0B',
  'Transitioning (Proficient)':         '#3B82F6',
  'At Grade Level (Highly Proficient)': '#7C9A6E',
}

const LEVEL_COLORS_MAP: Record<string, Record<string, string>> = {
  'CRLA':     LEVEL_COLORS_CRLA,
  'Phil-IRI': LEVEL_COLORS_PHILIRI,
  'RMA':      LEVEL_COLORS_RMA,
}

// DB field keys per assessment (same order as levels)
const ASSESSMENT_FIELDS: Record<string, string[]> = {
  'CRLA':     ['low_emerging', 'high_emerging', 'developing', 'transition', 'grade_level_reader'],
  'Phil-IRI': ['frustration', 'instructional', 'independent'],
  'RMA':      ['not_proficient', 'low_proficient', 'nearly_proficient', 'proficient', 'highly_proficient'],
}

const ASSESSMENT_INFO: Record<string, string> = {
  'CRLA':     'Classroom Reading Level Assessment — Grades 1–3. Measures early reading fluency and comprehension.',
  'Phil-IRI': 'Philippine Informal Reading Inventory — Grades 4–10. DepEd standard tool for reading proficiency in Filipino & English.',
  'RMA':      'Reading Miscue Analysis — Grades 1–10. Qualitative analysis of reading errors to guide targeted intervention.',
}

const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate', 'Repetition Rate'])
const KPI_META: Record<string, { icon: any; desc: string; color: string }> = {
  'Enrollment Rate':            { icon: Users,          desc: 'Learners enrolled vs. school-age population',   color: '#3B82F6' },
  'Participation Rate':         { icon: UserCheck,      desc: 'Active learners attending school',              color: '#8B5CF6' },
  'Cohort Survival Rate':       { icon: TrendingUp,     desc: 'Learners reaching final grade of a cycle',      color: '#7C9A6E' },
  'Completion Rate':            { icon: BookOpen,       desc: 'Learners completing the full school cycle',     color: '#7C9A6E' },
  'Promotion Rate':             { icon: GraduationCap,  desc: 'Learners promoted to the next grade level',     color: '#7C9A6E' },
  'Graduation Rate':            { icon: GraduationCap,  desc: 'Learners graduating from the program',          color: '#7C9A6E' },
  'Dropout/School Leaver Rate': { icon: UserX,          desc: 'Learners who left school before completion',    color: '#EF4444' },
  'Repetition Rate':            { icon: RefreshCw,      desc: 'Learners repeating the same grade level',       color: '#F59E0B' },
  'Retention Rate':             { icon: UserMinus,      desc: 'Learners retained from previous school year',   color: '#7C9A6E' },
  'Transition Rate':            { icon: ArrowRightLeft, desc: 'Learners moving to the next education level',   color: '#3B82F6' },
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
  const [selectedAssessment, setSelectedAssessment] = useState<'CRLA' | 'Phil-IRI' | 'RMA'>('CRLA')
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

  const levels = ASSESSMENT_LEVELS[selectedAssessment]
  const fields = ASSESSMENT_FIELDS[selectedAssessment]
  const colors = LEVEL_COLORS_MAP[selectedAssessment]
  const grades = ASSESSMENT_GRADES[selectedAssessment]

  // Filter reading rows for selected assessment, sorted by grade order
  const assessmentData = grades.map(g =>
    readingRows.find(r => r.assessment_type === selectedAssessment && r.grade_level === g)
  ).filter(Boolean)

  // Totals per level across all grades
  const levelTotals = fields.map(f =>
    assessmentData.reduce((s, r) => s + Number(r[f] || 0), 0)
  )
  const grandTotal = levelTotals.reduce((s, v) => s + v, 0)

  async function save() {
    setSaving(true)
    if (tab === 'kpi') {
      for (const r of kpiRows) await supabase.from('kpi').update({ value: r.value }).eq('id', r.id)
    } else if (tab === 'academic') {
      for (const r of gradeSubjects) await supabase.from('performance').update({ mps: r.mps }).eq('id', r.id)
    } else {
      for (const r of assessmentData) {
        const update: any = {}
        fields.forEach(f => { update[f] = r[f] })
        await supabase.from('reading_assessment').update(update).eq('id', r.id)
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

  // Chart data
  const chartData = assessmentData.map(r => {
    const obj: any = { name: r.grade_level.replace('Grade ', 'G') }
    fields.forEach((f, i) => { obj[levels[i]] = Number(r[f] || 0) })
    return obj
  })

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
              const valueColor = isNeg ? (val <= 2 ? '#7C9A6E' : '#EF4444') : (val >= 90 ? '#7C9A6E' : val >= 75 ? '#3B82F6' : '#EF4444')
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
                        value={r.value} onChange={e => setKpiRows(kpiRows.map(x => x.id === r.id ? { ...x, value: e.target.value } : x))} />
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
                    return <Cell key={i} fill={isNeg ? (val <= 2 ? '#7C9A6E' : '#EF4444') : (val >= 90 ? '#7C9A6E' : val >= 75 ? '#3B82F6' : '#EF4444')} />
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
          {/* Assessment selector */}
          <div className="flex flex-wrap gap-2">
            {(['CRLA', 'Phil-IRI', 'RMA'] as const).map(a => (
              <button key={a} onClick={() => setSelectedAssessment(a)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${selectedAssessment === a ? 'bg-[#7C9A6E] text-white border-[#7C9A6E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {a}
                <span className="ml-1.5 text-xs font-normal opacity-70">
                  {a === 'CRLA' ? '(Gr.1–3)' : a === 'Phil-IRI' ? '(Gr.4–10)' : '(Gr.1–10)'}
                </span>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            <strong>{selectedAssessment}</strong> — {ASSESSMENT_INFO[selectedAssessment]}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {levels.map(l => (
              <div key={l} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[l] }} />
                <span className="text-gray-600">{l}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-3 py-2 text-left whitespace-nowrap">Grade Level</th>
                  {levels.map(l => (
                    <th key={l} className="px-3 py-2 text-center text-xs whitespace-nowrap">{l}</th>
                  ))}
                  <th className="px-3 py-2 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {assessmentData.length === 0 ? (
                  <tr>
                    <td colSpan={levels.length + 2} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No data yet. {isAdmin ? 'Click Edit to add data.' : 'Admin has not entered data yet.'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {assessmentData.map((r, i) => {
                      const rowTotal = fields.reduce((s, f) => s + Number(r[f] || 0), 0)
                      return (
                        <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 font-medium whitespace-nowrap">{r.grade_level}</td>
                          {fields.map((f, fi) => (
                            <td key={f} className="px-3 py-2 text-center">
                              {editing ? (
                                <input type="number" className="w-14 border rounded px-1 text-center text-xs"
                                  value={r[f] || 0}
                                  onChange={e => updateReading(r.id, f, e.target.value)} />
                              ) : (
                                <span className="font-semibold" style={{ color: colors[levels[fi]] }}>
                                  {r[f] || 0}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-bold">{rowTotal}</td>
                        </tr>
                      )
                    })}
                    {/* Totals row */}
                    <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
                      <td className="px-3 py-2">TOTAL</td>
                      {levelTotals.map((t, i) => (
                        <td key={i} className="px-3 py-2 text-center" style={{ color: colors[levels[i]] }}>{t}</td>
                      ))}
                      <td className="px-3 py-2 text-center text-gray-800">{grandTotal}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Stacked bar chart */}
          {assessmentData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                {selectedAssessment} — Distribution by Grade Level
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  {levels.map((l, i) => (
                    <Bar
                      key={l}
                      dataKey={l}
                      stackId="a"
                      fill={colors[l]}
                      radius={i === levels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                    />
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
