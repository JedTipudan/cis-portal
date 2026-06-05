'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { Pencil, Save, X } from 'lucide-react'

const GRADE_LEVELS = ['Kinder','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']

const BMI_FIELDS  = ['severely_wasted','wasted','normal_bmi','overweight','obese']
const BMI_LABELS  = ['Severely Wasted','Wasted','Normal','Overweight','Obese']
const BMI_COLORS  = ['#EF4444','#F97316','#7C9A6E','#F59E0B','#8B5CF6']

const HFA_FIELDS  = ['severely_stunted','stunted','normal_hfa','tall']
const HFA_LABELS  = ['Severely Stunted','Stunted','Normal','Tall']
const HFA_COLORS  = ['#EF4444','#F97316','#7C9A6E','#3B82F6']

function sum(rows: any[], fields: string[]) {
  return fields.map(f => rows.reduce((s, r) => s + Number(r[f] || 0), 0))
}

function NutritionTable({
  rows, fields, labels, colors, editing, onChange
}: {
  rows: any[]; fields: string[]; labels: string[]; colors: string[]
  editing: boolean; onChange: (id: string, field: string, val: string) => void
}) {
  const totals = sum(rows, fields)
  const grand = totals.reduce((s, v) => s + v, 0)

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-xs">
        <thead className="bg-[#7C9A6E] text-white">
          <tr>
            <th className="px-3 py-2 text-left whitespace-nowrap">Grade Level</th>
            {labels.map((l, i) => (
              <th key={l} className="px-3 py-2 text-center whitespace-nowrap">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                  {l}
                </div>
              </th>
            ))}
            <th className="px-3 py-2 text-center font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rowTotal = fields.reduce((s, f) => s + Number(r[f] || 0), 0)
            return (
              <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{r.grade_level}</td>
                {fields.map((f, fi) => (
                  <td key={f} className="px-3 py-2 text-center">
                    {editing ? (
                      <input type="number" min="0"
                        className="w-14 border rounded px-1 py-0.5 text-center text-xs"
                        value={r[f] || 0}
                        onChange={e => onChange(r.id, f, e.target.value)} />
                    ) : (
                      <span className="font-semibold" style={{ color: colors[fi] }}>{r[f] || 0}</span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold">{rowTotal}</td>
              </tr>
            )
          })}
          <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300 text-sm">
            <td className="px-3 py-2">TOTAL</td>
            {totals.map((t, i) => (
              <td key={i} className="px-3 py-2 text-center" style={{ color: colors[i] }}>{t}</td>
            ))}
            <td className="px-3 py-2 text-center">{grand}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function NutritionChart({ rows, fields, labels, colors, title }: {
  rows: any[]; fields: string[]; labels: string[]; colors: string[]; title: string
}) {
  const chartData = rows.map(r => {
    const obj: any = { name: r.grade_level.replace('Grade ', 'G').replace('Kinder', 'K') }
    fields.forEach((f, i) => { obj[labels[i]] = Number(r[f] || 0) })
    return obj
  })
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs font-bold text-gray-500 uppercase mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          {labels.map((l, i) => (
            <Bar key={l} dataKey={l} stackId="a" fill={colors[i]}
              radius={i === labels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function NutritionalClient({
  data, isAdmin, schoolYear
}: {
  data: any[]; isAdmin: boolean; schoolYear: string
}) {
  const [rows, setRows] = useState(data)
  const [tab, setTab] = useState<'bmi' | 'hfa'>('bmi')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function onChange(id: string, field: string, val: string) {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  async function save() {
    setSaving(true)
    const fields = [...BMI_FIELDS, ...HFA_FIELDS]
    for (const r of rows) {
      const update: any = {}
      fields.forEach(f => { update[f] = Number(r[f] || 0) })
      await supabase.from('nutritional_status').update(update).eq('id', r.id)
    }
    setSaving(false)
    setEditing(false)
  }

  // Summary totals for stat cards
  const bmiTotals = sum(rows, BMI_FIELDS)
  const hfaTotals = sum(rows, HFA_FIELDS)
  const grandBMI  = bmiTotals.reduce((s, v) => s + v, 0)
  const grandHFA  = hfaTotals.reduce((s, v) => s + v, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nutritional Status</h1>
          <p className="text-gray-500 text-sm">School Year {schoolYear}</p>
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
            <button onClick={() => { setEditing(false); setRows(data) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {BMI_LABELS.map((l, i) => (
          <div key={l} className="bg-white rounded-xl border p-3 text-center shadow-sm">
            <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: `${BMI_COLORS[i]}18` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BMI_COLORS[i] }} />
            </div>
            <p className="text-xl font-bold" style={{ color: BMI_COLORS[i] }}>{bmiTotals[i]}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{l}</p>
            <p className="text-[10px] text-gray-400">{grandBMI > 0 ? ((bmiTotals[i] / grandBMI) * 100).toFixed(1) : 0}%</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {HFA_LABELS.map((l, i) => (
          <div key={l} className="bg-white rounded-xl border p-3 text-center shadow-sm">
            <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: `${HFA_COLORS[i]}18` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: HFA_COLORS[i] }} />
            </div>
            <p className="text-xl font-bold" style={{ color: HFA_COLORS[i] }}>{hfaTotals[i]}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{l}</p>
            <p className="text-[10px] text-gray-400">{grandHFA > 0 ? ((hfaTotals[i] / grandHFA) * 100).toFixed(1) : 0}%</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('bmi')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'bmi' ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
          Body Mass Index (BMI)
        </button>
        <button onClick={() => setTab('hfa')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'hfa' ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
          Height-for-Age (HFA)
        </button>
      </div>

      {tab === 'bmi' && (
        <div className="space-y-4">
          <NutritionTable rows={rows} fields={BMI_FIELDS} labels={BMI_LABELS} colors={BMI_COLORS} editing={editing} onChange={onChange} />
          <NutritionChart rows={rows} fields={BMI_FIELDS} labels={BMI_LABELS} colors={BMI_COLORS} title="BMI Distribution by Grade Level" />
        </div>
      )}

      {tab === 'hfa' && (
        <div className="space-y-4">
          <NutritionTable rows={rows} fields={HFA_FIELDS} labels={HFA_LABELS} colors={HFA_COLORS} editing={editing} onChange={onChange} />
          <NutritionChart rows={rows} fields={HFA_FIELDS} labels={HFA_LABELS} colors={HFA_COLORS} title="HFA Distribution by Grade Level" />
        </div>
      )}
    </div>
  )
}
