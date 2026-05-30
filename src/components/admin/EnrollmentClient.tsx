'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Pencil, Save, X } from 'lucide-react'

export default function EnrollmentClient({ enrollment, isAdmin }: { enrollment: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(enrollment)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const total = rows.reduce((s, r) => s + r.male + r.female, 0)
  const totalM = rows.reduce((s, r) => s + r.male, 0)
  const totalF = rows.reduce((s, r) => s + r.female, 0)

  async function save() {
    setSaving(true)
    for (const r of rows) {
      await supabase.from('enrollment').update({ male: r.male, female: r.female }).eq('id', r.id)
    }
    setSaving(false)
    setEditing(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Enrollment</h1>
          <p className="text-gray-500 text-sm">Total: {total.toLocaleString()} | Male: {totalM} | Female: {totalF}</p>
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
            <button onClick={() => { setEditing(false); setRows(enrollment) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Enrollment by Grade Level</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows.map(r => ({ name: r.grade_level.replace('Grade ', 'Gr.').replace('Kinder','K'), Male: r.male, Female: r.female }))}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Male" fill="#3B82F6" radius={[3,3,0,0]} />
              <Bar dataKey="Female" fill="#EC4899" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#7C9A6E] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Grade Level</th>
                <th className="px-4 py-2 text-center">Male</th>
                <th className="px-4 py-2 text-center">Female</th>
                <th className="px-4 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2">{r.grade_level}</td>
                  <td className="px-4 py-2 text-center">
                    {editing ? (
                      <input type="number" className="w-16 border rounded px-1 text-center text-xs" value={r.male}
                        onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, male: +e.target.value } : x))} />
                    ) : r.male}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {editing ? (
                      <input type="number" className="w-16 border rounded px-1 text-center text-xs" value={r.female}
                        onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, female: +e.target.value } : x))} />
                    ) : r.female}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold">{r.male + r.female}</td>
                </tr>
              ))}
              <tr className="bg-[#F5C842]/20 font-bold">
                <td className="px-4 py-2">TOTAL</td>
                <td className="px-4 py-2 text-center">{totalM}</td>
                <td className="px-4 py-2 text-center">{totalF}</td>
                <td className="px-4 py-2 text-center">{total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
