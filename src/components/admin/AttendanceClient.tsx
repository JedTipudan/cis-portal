'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const MONTHS = ['June','July','August','September','October','November','December','January','February','March','April','May']

export default function AttendanceClient({ attendance, isAdmin, schoolYear = '2024-2025', onSaved }: { attendance: any[]; isAdmin: boolean; schoolYear?: string; onSaved?: () => void }) {
  const [rows, setRows] = useState(attendance)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null; label: string }>({ show: false, id: null, label: '' })
  const supabase = createClient()

  const last = rows[rows.length - 1] || { present: 0, absent: 0 }
  const total = last.present + last.absent
  const ada = total > 0 ? ((last.present / total) * 100).toFixed(1) : '0'

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('attendance').insert({ month: r.month, present: r.present, absent: r.absent, school_year: schoolYear })
      } else {
        await supabase.from('attendance').update({ present: r.present, absent: r.absent }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    onSaved?.()

  async function deleteRow(id: string) {
    await supabase.from('attendance').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  const usedMonths = rows.map(r => r.month)
  const availableMonths = MONTHS.filter(m => !usedMonths.includes(m))

  function addMonth() {
    const nextMonth = availableMonths[0]
    if (!nextMonth) return
    setRows([...rows, { id: Date.now().toString(), month: nextMonth, present: 0, absent: 0, school_year: schoolYear, isNew: true }])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-500 text-sm">SY {schoolYear} — Average Daily Attendance: <strong>{ada}%</strong></p>
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
            <button onClick={() => { setEditing(false); setRows(attendance) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Monthly Attendance Trend</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#7C9A6E" strokeWidth={2} dot />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#7C9A6E] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-center">Present</th>
                <th className="px-4 py-2 text-center">Absent</th>
                <th className="px-4 py-2 text-center">ADA %</th>
                {editing && <th className="px-4 py-2 text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const t = r.present + r.absent
                const pct = t > 0 ? ((r.present / t) * 100).toFixed(1) : '0'
                return (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{r.month}</td>
                    <td className="px-4 py-2 text-center">
                      {editing ? (
                        <input type="number" className="w-20 border rounded px-1 text-center text-xs" value={r.present}
                          onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, present: +e.target.value } : x))} />
                      ) : r.present}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {editing ? (
                        <input type="number" className="w-20 border rounded px-1 text-center text-xs" value={r.absent}
                          onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, absent: +e.target.value } : x))} />
                      ) : r.absent}
                    </td>
                    <td className="px-4 py-2 text-center font-semibold text-[#7C9A6E]">{pct}%</td>
                    {editing && (
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => setConfirmDelete({ show: true, id: r.id, label: r.month })} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {editing && availableMonths.length > 0 && (
            <div className="p-3 border-t">
              <button onClick={addMonth}
                className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]">
                <Plus size={14} /> Add Month
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete.show}
        onOpenChange={open => setConfirmDelete(prev => ({ ...prev, show: open }))}
        title="Delete Attendance Record"
        description={`Are you sure you want to delete the attendance record for "${confirmDelete.label}"? This action cannot be undone.`}
        onConfirm={() => { if (confirmDelete.id) deleteRow(confirmDelete.id) }}
      />
    </div>
  )
}
