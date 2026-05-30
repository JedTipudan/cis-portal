'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Pencil, Save, X } from 'lucide-react'

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
]

const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate', 'Repetition Rate'])

export default function PerformanceClient({
  performance, kpi, isAdmin,
}: {
  performance: any[]; kpi: any[]; isAdmin: boolean
}) {
  const [tab, setTab] = useState<'kpi' | 'academic'>('kpi')
  const [selectedGrade, setSelectedGrade] = useState('Grade 1')
  const [kpiRows, setKpiRows] = useState(kpi)
  const [perfRows, setPerfRows] = useState(performance)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const gradeSubjects = perfRows.filter(r => r.grade_level === selectedGrade)
  const gradeMps = gradeSubjects.length
    ? (gradeSubjects.reduce((s, r) => s + Number(r.mps), 0) / gradeSubjects.length).toFixed(1)
    : '0'

  async function save() {
    setSaving(true)
    if (tab === 'kpi') {
      for (const r of kpiRows) {
        await supabase.from('kpi').update({ value: r.value }).eq('id', r.id)
      }
    } else {
      for (const r of gradeSubjects) {
        await supabase.from('performance').update({ mps: r.mps }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
    setKpiRows(kpi)
    setPerfRows(performance)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
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
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('kpi')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'kpi' ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
          Key Performance Indicators
        </button>
        <button onClick={() => setTab('academic')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'academic' ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
          Academic Performance
        </button>
      </div>

      {tab === 'kpi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* KPI Cards */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">KPI Overview</p>
            <div className="space-y-3">
              {kpiRows.map((r, i) => {
                const isNeg = NEGATIVE_KPIS.has(r.indicator)
                const color = isNeg
                  ? (Number(r.value) <= 2 ? '#7C9A6E' : '#EF4444')
                  : (Number(r.value) >= 90 ? '#7C9A6E' : Number(r.value) >= 75 ? '#F5C842' : '#EF4444')
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 w-44 leading-tight">{r.indicator}</span>
                    {!isNeg && (
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(Number(r.value), 100)}%`, backgroundColor: color }} />
                      </div>
                    )}
                    {isNeg && <div className="flex-1" />}
                    {editing ? (
                      <input type="number" step="0.1" className="w-16 border rounded px-1 text-center text-xs"
                        value={r.value}
                        onChange={e => setKpiRows(kpiRows.map(x => x.id === r.id ? { ...x, value: e.target.value } : x))} />
                    ) : (
                      <span className="text-sm font-bold w-14 text-right" style={{ color }}>{r.value}%</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* KPI Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">KPI Chart</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={kpiRows.map(r => ({ name: r.indicator.replace('/', '/\n'), value: Number(r.value) }))} layout="vertical" margin={{ left: 160 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={160} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {kpiRows.map((r, i) => {
                    const isNeg = NEGATIVE_KPIS.has(r.indicator)
                    const color = isNeg
                      ? (Number(r.value) <= 2 ? '#7C9A6E' : '#EF4444')
                      : (Number(r.value) >= 90 ? '#7C9A6E' : '#3B82F6')
                    return <Cell key={i} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'academic' && (
        <div className="space-y-4">
          {/* Grade selector */}
          <div className="flex flex-wrap gap-2">
            {GRADE_LEVELS.map(g => (
              <button key={g} onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedGrade === g ? 'bg-[#7C9A6E] text-white border-[#7C9A6E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7C9A6E]'}`}>
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">MPS by Subject — {selectedGrade}</p>
              <p className="text-xs text-gray-400 mb-3">Overall MPS: <strong className="text-gray-700">{gradeMps}</strong></p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gradeSubjects} layout="vertical" margin={{ left: 130 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="mps" radius={[0, 4, 4, 0]}>
                    {gradeSubjects.map((r, i) => (
                      <Cell key={i} fill={Number(r.mps) >= 85 ? '#7C9A6E' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
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
                          <input type="number" step="0.1" className="w-20 border rounded px-1 text-center text-xs"
                            value={r.mps}
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
    </div>
  )
}
