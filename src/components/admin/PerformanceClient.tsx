'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Pencil, Save, X } from 'lucide-react'

export default function PerformanceClient({ performance, isAdmin }: { performance: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(performance)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const overall = rows.length ? (rows.reduce((s, r) => s + Number(r.mps), 0) / rows.length).toFixed(1) : '0'

  async function save() {
    setSaving(true)
    for (const r of rows) {
      await supabase.from('performance').update({ mps: r.mps }).eq('id', r.id)
    }
    setSaving(false)
    setEditing(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
          <p className="text-gray-500 text-sm">Overall MPS: <strong>{overall}</strong></p>
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
            <button onClick={() => { setEditing(false); setRows(performance) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-3">MPS by Subject</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows} layout="vertical" margin={{ left: 120 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="mps" radius={[0, 4, 4, 0]}>
                {rows.map((_, i) => <Cell key={i} fill={Number(rows[i].mps) >= 85 ? '#7C9A6E' : '#3B82F6'} />)}
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
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2">{r.subject}</td>
                  <td className="px-4 py-2 text-center">
                    {editing ? (
                      <input type="number" step="0.1" className="w-20 border rounded px-1 text-center text-xs" value={r.mps}
                        onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, mps: e.target.value } : x))} />
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
                <td className="px-4 py-2 text-center">{overall}</td>
                <td className="px-4 py-2 text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
