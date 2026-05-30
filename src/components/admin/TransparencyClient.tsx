'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

const cats = ['MOOE Utilization', 'Programs & Projects', 'Procurement Summary']

export default function TransparencyClient({ transparency, isAdmin }: { transparency: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(transparency)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('transparency').insert({ category: r.category, label: r.label, value: r.value })
      } else {
        await supabase.from('transparency').update({ category: r.category, label: r.label, value: r.value }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteRow(id: string) {
    await supabase.from('transparency').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  const update = (id: string, field: string, val: string) =>
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transparency Board</h1>
          <p className="text-gray-500 text-sm">Financial and project transparency data</p>
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
            <button onClick={() => { setEditing(false); setRows(transparency) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cats.map(cat => (
          <div key={cat} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-[#7C9A6E] text-white px-4 py-2 text-sm font-bold">{cat}</div>
            <table className="w-full text-sm">
              <tbody>
                {rows.filter(r => r.category === cat).map((r, i) => (
                  <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">
                      {editing ? (
                        <input className="w-full border rounded px-2 py-1 text-xs" value={r.label}
                          onChange={e => update(r.id, 'label', e.target.value)} />
                      ) : <span className="text-gray-600">{r.label}</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {editing ? (
                        <input className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.value}
                          onChange={e => update(r.id, 'value', e.target.value)} />
                      ) : <span className="font-semibold">{r.value}</span>}
                    </td>
                    {editing && (
                      <td className="px-2 py-2">
                        <button onClick={() => deleteRow(r.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editing && (
              <div className="p-2 border-t">
                <button
                  onClick={() => setRows([...rows, { id: Date.now().toString(), category: cat, label: '', value: '', isNew: true }])}
                  className="flex items-center gap-1 text-xs text-[#7C9A6E] hover:text-[#5a7a52]"
                >
                  <Plus size={12} /> Add Row
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
