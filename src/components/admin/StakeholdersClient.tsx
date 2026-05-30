'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

export default function StakeholdersClient({ stakeholders, isAdmin }: { stakeholders: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(stakeholders)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('stakeholders').insert({ name: r.name, role: r.role, organization: r.organization, contact: r.contact })
      } else {
        await supabase.from('stakeholders').update({ name: r.name, role: r.role, organization: r.organization, contact: r.contact }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteRow(id: string) {
    await supabase.from('stakeholders').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  const update = (id: string, field: string, val: string) =>
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stakeholders</h1>
          <p className="text-gray-500 text-sm">Community partners and stakeholders</p>
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
            <button onClick={() => { setEditing(false); setRows(stakeholders) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Organization</th>
              <th className="px-4 py-2 text-left">Contact</th>
              {editing && <th className="px-4 py-2 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {['name', 'role', 'organization', 'contact'].map(field => (
                  <td key={field} className="px-4 py-2">
                    {editing ? (
                      <input className="w-full border rounded px-2 py-1 text-xs" value={r[field] || ''}
                        onChange={e => update(r.id, field, e.target.value)} />
                    ) : r[field] || '—'}
                  </td>
                ))}
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
              onClick={() => setRows([...rows, { id: Date.now().toString(), name: '', role: '', organization: '', contact: '', isNew: true }])}
              className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]"
            >
              <Plus size={14} /> Add Stakeholder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
