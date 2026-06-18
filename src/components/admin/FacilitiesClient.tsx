'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'

export default function FacilitiesClient({ facilities, isAdmin }: { facilities: any[]; isAdmin: boolean }) {
  const [rows, setRows] = useState(facilities)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null })
  const supabase = createClient()

  async function save() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) {
        await supabase.from('facilities').insert({ name: r.name, value: r.value })
      } else {
        await supabase.from('facilities').update({ name: r.name, value: r.value }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteRow(id: string) {
    await supabase.from('facilities').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facilities & Resources</h1>
          <p className="text-gray-500 text-sm">School infrastructure and resources</p>
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
            <button onClick={() => { setEditing(false); setRows(facilities) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#7C9A6E] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Facility / Resource</th>
              <th className="px-4 py-2 text-center">Value</th>
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
                <td className="px-4 py-2 text-center">
                  {editing ? (
                    <input className="w-24 border rounded px-2 py-1 text-xs text-center" value={r.value}
                      onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, value: e.target.value } : x))} />
                  ) : <span className="font-semibold">{r.value}</span>}
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
              onClick={() => setRows([...rows, { id: Date.now().toString(), name: '', value: '', isNew: true }])}
              className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete.show}
        onOpenChange={open => setConfirmDelete(prev => ({ ...prev, show: open }))}
        title="Delete Facility"
        description="Are you sure you want to delete this facility record? This action cannot be undone."
        onConfirm={() => { if (confirmDelete.id) deleteRow(confirmDelete.id) }}
      />
    </div>
  )
}
