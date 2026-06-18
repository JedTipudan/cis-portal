'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const statusOptions = ['Ongoing', 'Completed', 'Planned', 'Suspended']

export default function ProgramsClient({ programs, isAdmin }: { programs: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(programs)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null })
  const supabase = createClient()

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('programs').insert({ name: r.name, status: r.status, description: r.description })
      } else {
        await supabase.from('programs').update({ name: r.name, status: r.status, description: r.description }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteRow(id: string) {
    await supabase.from('programs').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Programs & Interventions</h1>
          <p className="text-gray-500 text-sm">{rows.length} programs listed</p>
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
            <button onClick={() => { setEditing(false); setRows(programs) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Program Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-center">Status</th>
              {editing && <th className="px-4 py-2 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2">
                  {editing ? (
                    <input className="w-full border rounded px-2 py-1 text-xs" value={r.name}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} />
                  ) : r.name}
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {editing ? (
                    <input className="w-full border rounded px-2 py-1 text-xs" value={r.description || ''}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, description: e.target.value } : x))} />
                  ) : r.description || '—'}
                </td>
                <td className="px-4 py-2 text-center">
                  {editing ? (
                    <select className="border rounded px-2 py-1 text-xs" value={r.status}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, status: e.target.value } : x))}>
                      {statusOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      r.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                      r.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.status}</span>
                  )}
                </td>
                {editing && (
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => setConfirmDelete({ show: true, id: r.id })} className="text-red-500 hover:text-red-700">
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
              onClick={() => setRows([...rows, { id: Date.now().toString(), name: '', status: 'Ongoing', description: '', isNew: true }])}
              className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]"
            >
              <Plus size={14} /> Add Program
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete.show}
        onOpenChange={open => setConfirmDelete(prev => ({ ...prev, show: open }))}
        title="Delete Program"
        description="Are you sure you want to delete this program? This action cannot be undone."
        onConfirm={() => { if (confirmDelete.id) deleteRow(confirmDelete.id) }}
      />
    </div>
  )
}
