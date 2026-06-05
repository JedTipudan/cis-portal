'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

const PROFILE_COLORS: Record<string, string> = {
  'Male': '#3B82F6', 'Female': '#EC4899',
  'SPED': '#8B5CF6', 'IP': '#F59E0B', 'Others': '#6B7280',
}

function getColor(category: string, index: number) {
  return PROFILE_COLORS[category] || ['#7C9A6E','#EF4444','#F97316','#14B8A6','#6366F1'][index % 5]
}

export default function EnrollmentClient({
  enrollment, learnerProfile, isAdmin, schoolYear = '2024-2025'
}: {
  enrollment: any[]
  learnerProfile: any[]
  isAdmin: boolean
  schoolYear?: string
}) {
  const [rows, setRows] = useState(enrollment)
  const [profileRows, setProfileRows] = useState(learnerProfile)
  const [tab, setTab] = useState<'enrollment' | 'profile'>('enrollment')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const total = rows.reduce((s, r) => s + r.male + r.female, 0)
  const totalM = rows.reduce((s, r) => s + r.male, 0)
  const totalF = rows.reduce((s, r) => s + r.female, 0)
  const totalProfile = profileRows.reduce((s, r) => s + Number(r.count), 0)

  async function saveEnrollment() {
    setSaving(true)
    for (const r of rows) {
      await supabase.from('enrollment').update({ male: r.male, female: r.female }).eq('id', r.id)
    }
    setSaving(false)
    setEditing(false)
  }

  async function saveProfile() {
    setSaving(true)
    for (const r of profileRows) {
      if (r.isNew) {
        await supabase.from('learner_profile').insert({ category: r.category, count: r.count, school_year: schoolYear })
      } else {
        await supabase.from('learner_profile').update({ category: r.category, count: r.count }).eq('id', r.id)
      }
    }
    setSaving(false)
    setEditing(false)
    window.location.reload()
  }

  async function deleteProfile(id: string) {
    await supabase.from('learner_profile').delete().eq('id', id)
    setProfileRows(profileRows.filter(r => r.id !== id))
  }

  function cancel() {
    setEditing(false)
    setRows(enrollment)
    setProfileRows(learnerProfile)
  }

  const pieData = profileRows.map((p, i) => ({
    name: p.category,
    value: Number(p.count),
    color: getColor(p.category, i),
  }))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
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
            <button onClick={tab === 'enrollment' ? saveEnrollment : saveProfile} disabled={saving}
              className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {[{ key: 'enrollment', label: 'By Grade Level' }, { key: 'profile', label: 'Learner Profile' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ENROLLMENT BY GRADE TAB ── */}
      {tab === 'enrollment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Enrollment by Grade Level</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rows.map(r => ({
                name: r.grade_level.replace('Grade ', 'Gr.').replace('Kinder', 'K'),
                Male: r.male, Female: r.female
              }))}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Male" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Female" fill="#EC4899" radius={[3, 3, 0, 0]} />
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
      )}

      {/* ── LEARNER PROFILE TAB ── */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Learner Profile Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip formatter={(v: any, name: any) => [`${v} learners`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs font-bold text-gray-700 mt-1">Total: {totalProfile.toLocaleString()} Learners</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-center">Count</th>
                  <th className="px-4 py-2 text-center">%</th>
                  {editing && <th className="px-4 py-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {profileRows.map((r, i) => (
                  <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">
                      {editing ? (
                        <input className="w-full border rounded px-2 py-1 text-xs" value={r.category}
                          onChange={e => setProfileRows(profileRows.map(x => x.id === r.id ? { ...x, category: e.target.value } : x))} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(r.category, i) }} />
                          {r.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {editing ? (
                        <input type="number" className="w-20 border rounded px-1 text-center text-xs" value={r.count}
                          onChange={e => setProfileRows(profileRows.map(x => x.id === r.id ? { ...x, count: +e.target.value } : x))} />
                      ) : <span className="font-semibold">{r.count}</span>}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-500">
                      {totalProfile > 0 ? ((Number(r.count) / totalProfile) * 100).toFixed(1) : 0}%
                    </td>
                    {editing && (
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => deleteProfile(r.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="bg-[#F5C842]/20 font-bold">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-center">{totalProfile}</td>
                  <td className="px-4 py-2 text-center">100%</td>
                  {editing && <td />}
                </tr>
              </tbody>
            </table>
            {editing && (
              <div className="p-3 border-t">
                <button
                  onClick={() => setProfileRows([...profileRows, { id: Date.now().toString(), category: '', count: 0, isNew: true }])}
                  className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]">
                  <Plus size={14} /> Add Category
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
