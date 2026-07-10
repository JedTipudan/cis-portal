'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid, LineChart, Line
} from 'recharts'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const CATS = ['MOOE Utilization', 'Programs & Projects', 'Other Funds']

const TABS = [
  { key: 'overview',       label: 'Overview' },
  { key: 'mooe',           label: 'MOOE Monthly' },
  { key: 'programs',       label: 'Programs Monthly' },
  { key: 'other-funds',    label: 'Other Funds (IGP & Canteen)' },
]

const fmt = (n: number) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })

export default function TransparencyClient({
  transparency, otherFunds, mooeMonthly, programsMonthly, isAdmin,
}: {
  transparency: any[]
  otherFunds: any[]
  mooeMonthly: any[]
  programsMonthly: any[]
  isAdmin: boolean
}) {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'overview'|'mooe'|'programs'|'other-funds'>('overview')
  const [rows, setRows] = useState(transparency)
  const [fundRows, setFundRows] = useState(otherFunds)
  const [mooeRows, setMooeRows] = useState(mooeMonthly)
  const [progRows, setProgRows] = useState(programsMonthly)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null; type: string; label: string }>({ show: false, id: null, type: '', label: '' })
  const supabase = createClient()

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'mooe' || t === 'programs' || t === 'other-funds') setTab(t)
  }, [searchParams])

  // ── Totals ──
  const igpCapTotal = fundRows.reduce((s, r) => s + Number(r.igp_capitalization), 0)
  const igpReinvTotal = fundRows.reduce((s, r) => s + Number(r.igp_reinvestment), 0)
  const igpBalTotal = igpCapTotal - igpReinvTotal
  const canCapTotal = fundRows.reduce((s, r) => s + Number(r.canteen_capitalization), 0)
  const canReinvTotal = fundRows.reduce((s, r) => s + Number(r.canteen_reinvestment), 0)
  const canBalTotal = canCapTotal - canReinvTotal
  const totalAllocated = mooeRows.reduce((s, r) => s + Number(r.allocated), 0)
  const totalUtilized = mooeRows.reduce((s, r) => s + Number(r.utilized), 0)
  const totalBalance = totalAllocated - totalUtilized
  const lastProg = progRows[progRows.length - 1] || { implemented: 0, ongoing: 0, completed: 0 }

  // ── Save handlers ──
  async function saveOverview() {
    setSaving(true)
    for (const r of rows) {
      if (r.isNew) await supabase.from('transparency').insert({ category: r.category, label: r.label, value: r.value })
      else await supabase.from('transparency').update({ category: r.category, label: r.label, value: r.value }).eq('id', r.id)
    }
    setSaving(false); setEditing(false); window.location.reload()
  }

  async function saveMooe() {
    setSaving(true)
    for (const r of mooeRows) {
      if (r.isNew) await supabase.from('mooe_monthly').insert({ month: r.month, allocated: r.allocated, utilized: r.utilized, school_year: null })
      else await supabase.from('mooe_monthly').update({ allocated: r.allocated, utilized: r.utilized }).eq('id', r.id)
    }
    setSaving(false); setEditing(false)
    window.location.reload()
  }

  async function savePrograms() {
    setSaving(true)
    for (const r of progRows) {
      if (r.isNew) await supabase.from('programs_monthly').insert({ month: r.month, implemented: r.implemented, ongoing: r.ongoing, completed: r.completed })
      else await supabase.from('programs_monthly').update({ implemented: r.implemented, ongoing: r.ongoing, completed: r.completed }).eq('id', r.id)
    }
    setSaving(false); setEditing(false)
    window.location.reload()
  }

  async function saveFunds() {
    setSaving(true)
    for (const r of fundRows) {
      if (r.isNew) await supabase.from('other_funds').insert({ month: r.month, igp_capitalization: r.igp_capitalization, igp_reinvestment: r.igp_reinvestment, canteen_capitalization: r.canteen_capitalization, canteen_reinvestment: r.canteen_reinvestment })
      else await supabase.from('other_funds').update({
        igp_capitalization: r.igp_capitalization, igp_reinvestment: r.igp_reinvestment,
        canteen_capitalization: r.canteen_capitalization, canteen_reinvestment: r.canteen_reinvestment
      }).eq('id', r.id)
    }
    setSaving(false); setEditing(false)
    window.location.reload()
  }

  function handleSave() {
    if (tab === 'overview') saveOverview()
    else if (tab === 'mooe') saveMooe()
    else if (tab === 'programs') savePrograms()
    else saveFunds()
  }

  function cancel() {
    setEditing(false)
    setRows(transparency); setFundRows(otherFunds)
    setMooeRows(mooeMonthly); setProgRows(programsMonthly)
  }

  async function deleteRow(id: string) {
    await supabase.from('transparency').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  async function deleteMooeRow(id: string) {
    await supabase.from('mooe_monthly').delete().eq('id', id)
    setMooeRows(mooeRows.filter(r => r.id !== id))
  }

  async function deleteProgRow(id: string) {
    await supabase.from('programs_monthly').delete().eq('id', id)
    setProgRows(progRows.filter(r => r.id !== id))
  }

  async function deleteFundRow(id: string) {
    await supabase.from('other_funds').delete().eq('id', id)
    setFundRows(fundRows.filter(r => r.id !== id))
  }

  const MONTHS = ['June','July','August','September','October','November','December','January','February','March','April','May']

  function addMooeRow() {
    const used = mooeRows.map(r => r.month)
    const next = MONTHS.find(m => !used.includes(m))
    if (!next) return
    setMooeRows([...mooeRows, { id: Date.now().toString(), month: next, allocated: 0, utilized: 0, isNew: true }])
  }

  function addProgRow() {
    const used = progRows.map(r => r.month)
    const next = MONTHS.find(m => !used.includes(m))
    if (!next) return
    setProgRows([...progRows, { id: Date.now().toString(), month: next, implemented: 0, ongoing: 0, completed: 0, isNew: true }])
  }

  function addFundRow() {
    const used = fundRows.map(r => r.month)
    const next = MONTHS.find(m => !used.includes(m))
    if (!next) return
    setFundRows([...fundRows, { id: Date.now().toString(), month: next, igp_capitalization: 0, igp_reinvestment: 0, canteen_capitalization: 0, canteen_reinvestment: 0, isNew: true }])
  }

  const updateRow = (id: string, f: string, v: string) => setRows(rows.map(r => r.id === id ? { ...r, [f]: v } : r))
  const updateMooe = (id: string, f: string, v: string) => setMooeRows(mooeRows.map(r => r.id === id ? { ...r, [f]: v } : r))
  const updateProg = (id: string, f: string, v: string) => setProgRows(progRows.map(r => r.id === id ? { ...r, [f]: v } : r))
  const updateFund = (id: string, f: string, v: string) => setFundRows(fundRows.map(r => r.id === id ? { ...r, [f]: v } : r))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
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
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">MOOE Allocated</p>
              <p className="text-lg font-bold text-[#7C9A6E]">{fmt(totalAllocated)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">MOOE Balance</p>
              <p className="text-lg font-bold text-[#3B82F6]">{fmt(totalBalance)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">IGP Balance</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{fmt(igpBalTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Canteen Balance</p>
              <p className="text-lg font-bold text-[#F59E0B]">{fmt(canBalTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CATS.map(cat => (
              <div key={cat} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-[#7C9A6E] text-white px-4 py-2 text-sm font-bold">{cat}</div>
                <table className="w-full text-sm">
                  <tbody>
                    {cat === 'MOOE Utilization' && !editing ? (
                      <>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">Allocated</td><td className="px-4 py-2 text-right font-semibold">{fmt(totalAllocated)}</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-2 text-gray-600">Utilized</td><td className="px-4 py-2 text-right font-semibold">{fmt(totalUtilized)}</td></tr>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">Balance</td><td className="px-4 py-2 text-right font-semibold text-[#7C9A6E]">{fmt(totalBalance)}</td></tr>
                      </>
                    ) : cat === 'Programs & Projects' && !editing ? (
                      <>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">Implemented Projects</td><td className="px-4 py-2 text-right font-semibold">{lastProg.implemented}</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-2 text-gray-600">Ongoing Projects</td><td className="px-4 py-2 text-right font-semibold">{lastProg.ongoing}</td></tr>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">Completed Projects</td><td className="px-4 py-2 text-right font-semibold">{lastProg.completed}</td></tr>
                      </>
                    ) : cat === 'Other Funds' && !editing ? (
                      <>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">IGP Balance</td><td className="px-4 py-2 text-right font-semibold text-[#7C9A6E]">{fmt(igpBalTotal)}</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-2 text-gray-600">Canteen Balance</td><td className="px-4 py-2 text-right font-semibold text-[#3B82F6]">{fmt(canBalTotal)}</td></tr>
                        <tr className="bg-white"><td className="px-4 py-2 text-gray-600">Combined Balance</td><td className="px-4 py-2 text-right font-semibold">{fmt(igpBalTotal + canBalTotal)}</td></tr>
                      </>
                    ) : (
                      rows.filter(r => r.category === cat).map((r, i) => (
                        <tr key={r.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2">
                            {editing ? <input className="w-full border rounded px-2 py-1 text-xs" value={r.label} onChange={e => updateRow(r.id, 'label', e.target.value)} />
                              : <span className="text-gray-600">{r.label}</span>}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {editing ? <input className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.value} onChange={e => updateRow(r.id, 'value', e.target.value)} />
                              : <span className="font-semibold">{r.value}</span>}
                          </td>
                          {editing && <td className="px-2"><button onClick={() => setConfirmDelete({ show: true, id: r.id, type: 'overview', label: r.label })} className="text-red-500"><Trash2 size={12} /></button></td>}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {editing && (
                  <div className="p-2 border-t">
                    <button onClick={() => setRows([...rows, { id: Date.now().toString(), category: cat, label: '', value: '', isNew: true }])}
                      className="flex items-center gap-1 text-xs text-[#7C9A6E]"><Plus size={12} /> Add Row</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MOOE MONTHLY ── */}
      {tab === 'mooe' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Allocated</p>
              <p className="text-xl font-bold text-[#7C9A6E]">{fmt(totalAllocated)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Utilized</p>
              <p className="text-xl font-bold text-[#3B82F6]">{fmt(totalUtilized)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Balance</p>
              <p className="text-xl font-bold text-[#F59E0B]">{fmt(totalBalance)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Monthly MOOE Utilization</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mooeRows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" fill="#7C9A6E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="utilized" name="Utilized" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">Allocated</th>
                  <th className="px-4 py-2 text-right">Utilized</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                  {editing && <th className="px-4 py-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {mooeRows.map((r, i) => {
                  const bal = Number(r.allocated) - Number(r.utilized)
                  return (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">
                        {editing && r.isNew
                          ? <select className="border rounded px-2 py-1 text-xs" value={r.month} onChange={e => updateMooe(r.id,'month',e.target.value)}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select>
                          : r.month}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.allocated} onChange={e => updateMooe(r.id, 'allocated', e.target.value)} />
                          : <span className="text-[#7C9A6E] font-semibold">{fmt(r.allocated)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.utilized} onChange={e => updateMooe(r.id, 'utilized', e.target.value)} />
                          : <span className="text-[#3B82F6] font-semibold">{fmt(r.utilized)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right font-bold" style={{ color: bal >= 0 ? '#7C9A6E' : '#EF4444' }}>{fmt(bal)}</td>
                      {editing && <td className="px-2"><button onClick={() => setConfirmDelete({ show: true, id: r.id, type: 'mooe', label: r.month })} className="text-red-500"><Trash2 size={12} /></button></td>}
                    </tr>
                  )
                })}
                <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-right text-[#7C9A6E]">{fmt(totalAllocated)}</td>
                  <td className="px-4 py-2 text-right text-[#3B82F6]">{fmt(totalUtilized)}</td>
                  <td className="px-4 py-2 text-right">{fmt(totalBalance)}</td>
                  {editing && <td />}
                </tr>
              </tbody>
            </table>
            {editing && (
              <div className="p-3 border-t">
                <button onClick={addMooeRow} className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]">
                  <Plus size={14} /> Add Month
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROGRAMS MONTHLY ── */}
      {tab === 'programs' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Implemented</p>
              <p className="text-3xl font-bold text-[#7C9A6E]">{lastProg.implemented}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ongoing</p>
              <p className="text-3xl font-bold text-[#3B82F6]">{lastProg.ongoing}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#F59E0B]">{lastProg.completed}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Monthly Programs & Projects Progress</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progRows} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="implemented" name="Implemented" stroke="#7C9A6E" strokeWidth={2} dot />
                <Line type="monotone" dataKey="ongoing" name="Ongoing" stroke="#3B82F6" strokeWidth={2} dot />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#F59E0B" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-center">Implemented</th>
                  <th className="px-4 py-2 text-center">Ongoing</th>
                  <th className="px-4 py-2 text-center">Completed</th>
                  {editing && <th className="px-4 py-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {progRows.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium">
                      {editing && r.isNew
                        ? <select className="border rounded px-2 py-1 text-xs" value={r.month} onChange={e => updateProg(r.id,'month',e.target.value)}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select>
                        : r.month}
                    </td>
                    {['implemented', 'ongoing', 'completed'].map(f => (
                      <td key={f} className="px-4 py-2 text-center">
                        {editing ? <input type="number" className="w-16 border rounded px-1 text-center text-xs" value={r[f]} onChange={e => updateProg(r.id, f, e.target.value)} />
                          : <span className="font-semibold">{r[f]}</span>}
                      </td>
                    ))}
                    {editing && <td className="px-2"><button onClick={() => setConfirmDelete({ show: true, id: r.id, type: 'programs', label: r.month })} className="text-red-500"><Trash2 size={12} /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {editing && (
              <div className="p-3 border-t">
                <button onClick={addProgRow} className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]">
                  <Plus size={14} /> Add Month
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OTHER FUNDS ── */}
      {tab === 'other-funds' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">IGP Capitalization</p>
              <p className="text-lg font-bold text-[#7C9A6E]">{fmt(igpCapTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">IGP Balance</p>
              <p className="text-lg font-bold text-[#3B82F6]">{fmt(igpBalTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Canteen Capitalization</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{fmt(canCapTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Canteen Balance</p>
              <p className="text-lg font-bold text-[#F59E0B]">{fmt(canBalTotal)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Monthly IGP & Canteen — Capitalization vs Reinvestment</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={fundRows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Legend />
                <Bar dataKey="igp_capitalization" name="IGP Capitalization" fill="#7C9A6E" radius={[3,3,0,0]} />
                <Bar dataKey="igp_reinvestment" name="IGP Reinvestment" fill="#a8c49a" radius={[3,3,0,0]} />
                <Bar dataKey="canteen_capitalization" name="Canteen Capitalization" fill="#3B82F6" radius={[3,3,0,0]} />
                <Bar dataKey="canteen_reinvestment" name="Canteen Reinvestment" fill="#93c5fd" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* IGP Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <div className="bg-[#7C9A6E] text-white px-4 py-2 text-sm font-bold">IGP (Income Generating Project)</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Month</th>
                  <th className="px-4 py-2 text-right text-gray-600">Capitalization</th>
                  <th className="px-4 py-2 text-right text-gray-600">Reinvestment</th>
                  <th className="px-4 py-2 text-right text-gray-600">Balance</th>
                  {editing && <th className="px-4 py-2 text-center text-gray-600">Action</th>}
                </tr>
              </thead>
              <tbody>
                {fundRows.map((r, i) => {
                  const bal = Number(r.igp_capitalization) - Number(r.igp_reinvestment)
                  return (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">
                        {editing && r.isNew
                          ? <select className="border rounded px-2 py-1 text-xs" value={r.month} onChange={e => updateFund(r.id,'month',e.target.value)}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select>
                          : r.month}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.igp_capitalization} onChange={e => updateFund(r.id, 'igp_capitalization', e.target.value)} />
                          : <span className="text-[#7C9A6E] font-semibold">{fmt(r.igp_capitalization)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.igp_reinvestment} onChange={e => updateFund(r.id, 'igp_reinvestment', e.target.value)} />
                          : <span className="text-[#3B82F6] font-semibold">{fmt(r.igp_reinvestment)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right font-bold" style={{ color: bal >= 0 ? '#7C9A6E' : '#EF4444' }}>{fmt(bal)}</td>
                      {editing && <td className="px-2"><button onClick={() => setConfirmDelete({ show: true, id: r.id, type: 'igp', label: r.month })} className="text-red-500"><Trash2 size={12} /></button></td>}
                    </tr>
                  )
                })}
                <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-right text-[#7C9A6E]">{fmt(igpCapTotal)}</td>
                  <td className="px-4 py-2 text-right text-[#3B82F6]">{fmt(igpReinvTotal)}</td>
                  <td className="px-4 py-2 text-right" style={{ color: igpBalTotal >= 0 ? '#7C9A6E' : '#EF4444' }}>{fmt(igpBalTotal)}</td>
                  {editing && <td />}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Canteen Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <div className="bg-[#3B82F6] text-white px-4 py-2 text-sm font-bold">Canteen</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Month</th>
                  <th className="px-4 py-2 text-right text-gray-600">Capitalization</th>
                  <th className="px-4 py-2 text-right text-gray-600">Reinvestment</th>
                  <th className="px-4 py-2 text-right text-gray-600">Balance</th>
                  {editing && <th className="px-4 py-2 text-center text-gray-600">Action</th>}
                </tr>
              </thead>
              <tbody>
                {fundRows.map((r, i) => {
                  const bal = Number(r.canteen_capitalization) - Number(r.canteen_reinvestment)
                  return (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">
                        {r.month}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.canteen_capitalization} onChange={e => updateFund(r.id, 'canteen_capitalization', e.target.value)} />
                          : <span className="text-[#7C9A6E] font-semibold">{fmt(r.canteen_capitalization)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editing ? <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right" value={r.canteen_reinvestment} onChange={e => updateFund(r.id, 'canteen_reinvestment', e.target.value)} />
                          : <span className="text-[#8B5CF6] font-semibold">{fmt(r.canteen_reinvestment)}</span>}
                      </td>
                      <td className="px-4 py-2 text-right font-bold" style={{ color: bal >= 0 ? '#7C9A6E' : '#EF4444' }}>{fmt(bal)}</td>
                      {editing && <td className="px-2"><button onClick={() => setConfirmDelete({ show: true, id: r.id, type: 'canteen', label: r.month })} className="text-red-500"><Trash2 size={12} /></button></td>}
                    </tr>
                  )
                })}
                <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-right text-[#3B82F6]">{fmt(canCapTotal)}</td>
                  <td className="px-4 py-2 text-right text-[#8B5CF6]">{fmt(canReinvTotal)}</td>
                  <td className="px-4 py-2 text-right" style={{ color: canBalTotal >= 0 ? '#7C9A6E' : '#EF4444' }}>{fmt(canBalTotal)}</td>
                  {editing && <td />}
                </tr>
              </tbody>
            </table>
            {editing && (
              <div className="p-3 border-t">
                <button onClick={addFundRow} className="flex items-center gap-1 text-sm text-[#7C9A6E] hover:text-[#5a7a52]">
                  <Plus size={14} /> Add Month
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.show}
        onOpenChange={open => setConfirmDelete(prev => ({ ...prev, show: open }))}
        title={`Delete ${confirmDelete.type === 'overview' ? 'Transparency Record' : confirmDelete.type === 'mooe' ? 'MOOE Record' : confirmDelete.type === 'programs' ? 'Programs Record' : 'Fund Record'}`}
        description={`Are you sure you want to delete the record for "${confirmDelete.label}"? This action cannot be undone.`}
        onConfirm={() => {
          if (!confirmDelete.id) return
          if (confirmDelete.type === 'overview') deleteRow(confirmDelete.id)
          else if (confirmDelete.type === 'mooe') deleteMooeRow(confirmDelete.id)
          else if (confirmDelete.type === 'programs') deleteProgRow(confirmDelete.id)
          else deleteFundRow(confirmDelete.id)
        }}
      />
    </div>
  )
}
