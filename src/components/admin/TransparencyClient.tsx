'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

const CATS = ['MOOE Utilization', 'Programs & Projects', 'Other Funds']

const MONTHS = ['June','July','August','September','October','November','December','January','February','March','April','May']

function fmt(n: number) {
  return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

export default function TransparencyClient({
  transparency, otherFunds, isAdmin
}: {
  transparency: any[]
  otherFunds: any[]
  isAdmin: boolean
}) {
  const [rows, setRows] = useState(transparency)
  const [fundRows, setFundRows] = useState(otherFunds)
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'overview' | 'other-funds'>('overview')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'other-funds') setTab('other-funds')
  }, [searchParams])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Overview save
  async function saveOverview() {
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

  // Other funds save
  async function saveFunds() {
    setSaving(true)
    for (const r of fundRows) {
      await supabase.from('other_funds').update({ igp: r.igp, canteen: r.canteen }).eq('id', r.id)
    }
    setSaving(false)
    setEditing(false)
  }

  async function deleteRow(id: string) {
    await supabase.from('transparency').delete().eq('id', id)
    setRows(rows.filter(r => r.id !== id))
  }

  function cancel() {
    setEditing(false)
    setRows(transparency)
    setFundRows(otherFunds)
  }

  const update = (id: string, field: string, val: string) =>
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r))

  const updateFund = (id: string, field: string, val: string) =>
    setFundRows(fundRows.map(r => r.id === id ? { ...r, [field]: val } : r))

  // Totals for Other Funds
  const totalIgp = fundRows.reduce((s, r) => s + Number(r.igp), 0)
  const totalCanteen = fundRows.reduce((s, r) => s + Number(r.canteen), 0)

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
            <button onClick={tab === 'overview' ? saveOverview : saveFunds} disabled={saving}
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
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'other-funds', label: 'Other Funds (IGP & Canteen)' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-[#7C9A6E]' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATS.map(cat => (
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
                  {/* Show totals for Other Funds in overview */}
                  {cat === 'Other Funds' && !editing && (
                    <>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">IGP Total</td>
                        <td className="px-4 py-2 text-right font-semibold text-[#7C9A6E]">{fmt(totalIgp)}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-4 py-2 text-gray-600">Canteen Total</td>
                        <td className="px-4 py-2 text-right font-semibold text-[#7C9A6E]">{fmt(totalCanteen)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              {editing && (
                <div className="p-2 border-t">
                  <button
                    onClick={() => setRows([...rows, { id: Date.now().toString(), category: cat, label: '', value: '', isNew: true }])}
                    className="flex items-center gap-1 text-xs text-[#7C9A6E] hover:text-[#5a7a52]">
                    <Plus size={12} /> Add Row
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── OTHER FUNDS TAB ── */}
      {tab === 'other-funds' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">IGP Total</p>
              <p className="text-2xl font-bold text-[#7C9A6E]">{fmt(totalIgp)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Canteen Total</p>
              <p className="text-2xl font-bold text-[#3B82F6]">{fmt(totalCanteen)}</p>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Combined Total</p>
              <p className="text-2xl font-bold text-gray-800">{fmt(totalIgp + totalCanteen)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Monthly IGP & Canteen Funds</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={fundRows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Legend />
                <Bar dataKey="igp" name="IGP" fill="#7C9A6E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="canteen" name="Canteen" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#7C9A6E] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-right">IGP</th>
                  <th className="px-4 py-2 text-right">Canteen</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {fundRows.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium">{r.month}</td>
                    <td className="px-4 py-2 text-right">
                      {editing ? (
                        <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right"
                          value={r.igp} onChange={e => updateFund(r.id, 'igp', e.target.value)} />
                      ) : <span className="text-[#7C9A6E] font-semibold">{fmt(r.igp)}</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {editing ? (
                        <input type="number" className="w-28 border rounded px-2 py-1 text-xs text-right"
                          value={r.canteen} onChange={e => updateFund(r.id, 'canteen', e.target.value)} />
                      ) : <span className="text-[#3B82F6] font-semibold">{fmt(r.canteen)}</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-bold">{fmt(Number(r.igp) + Number(r.canteen))}</td>
                  </tr>
                ))}
                <tr className="bg-[#F5C842]/20 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-right text-[#7C9A6E]">{fmt(totalIgp)}</td>
                  <td className="px-4 py-2 text-right text-[#3B82F6]">{fmt(totalCanteen)}</td>
                  <td className="px-4 py-2 text-right">{fmt(totalIgp + totalCanteen)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
