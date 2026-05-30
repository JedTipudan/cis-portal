'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Save, X } from 'lucide-react'

const fields = [
  { key: 'school_name', label: 'School Name' },
  { key: 'school_id', label: 'School ID' },
  { key: 'district', label: 'District' },
  { key: 'division', label: 'Division' },
  { key: 'region', label: 'Region' },
  { key: 'school_head', label: 'School Head' },
  { key: 'school_type', label: 'School Type' },
  { key: 'location', label: 'Location' },
  { key: 'school_year', label: 'School Year' },
]

export default function SchoolProfileClient({ profile, isAdmin }: { profile: any; isAdmin: boolean }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(profile || {})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function save() {
    setSaving(true)
    await supabase.from('school_profile').update(form).eq('id', form.id)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Profile</h1>
          <p className="text-gray-500 text-sm">Basic school information</p>
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a7a52]">
            <Pencil size={14} /> Edit
          </button>
        )}
        {isAdmin && editing && (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a7a52]">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setForm(profile) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium text-gray-500 flex-shrink-0">{label}</label>
            {editing ? (
              <input
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
                value={form[key] || ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <span className="text-sm text-gray-800">{form[key] || '—'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
