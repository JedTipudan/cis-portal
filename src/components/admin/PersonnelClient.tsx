'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

export default function PersonnelClient({ personnel, isAdmin }: { personnel: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(personnel)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('personnel').insert({ category: r.category, count: r.count })
      } else {
        await supabase.from('personnel').update({ category: r.category, count: r.count }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteRow(id: string) {
    await supabase.from('personnel').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Personnel</h1>
          <p className="text-gray-500 text-sm">Teaching and non-teaching staff</p>
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
            <button onClick={() => { setEditing(false); setRows(personnel) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-center">Count</th>
              {editing && <th className="px-4 py-2 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2">
                  {editing ? (
                    <input className="w-full border rounded px-2 py-1 text-xs" value={r.category}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, category: e.target.value } : x))} />
                  ) : r.category}
                </td>
                <td className="px-4 py-2 text-center">
                  {editing ? (
                    <input type="number" className="w-20 border rounded px-1 text-center text-xs" value={r.count}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, count: +e.target.value } : x))} />
                  ) : <span className="font-semibold">{r.count}</span>}
                </td>
                {editing && (
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => deleteRow(r.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {editing && (
          <div className="p-3 border-t">
            <button
              onClick={() => setRows([...rows, { id: Date.now().toString(), category: '', count: 0, isNew: true }])}
              className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
