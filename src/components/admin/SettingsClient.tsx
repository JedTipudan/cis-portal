'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

export default function SettingsClient({ user }: { user: any }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function updatePassword() {
    if (password !== confirm) { setMsg('Passwords do not match'); return }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setMsg(error ? error.message : 'Password updated successfully!')
    setPassword('')
    setConfirm('')
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your admin account</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
          <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">{user.email}</p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">New Password</label>
              <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Confirm Password</label>
              <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            {msg && <p className={`text-sm ${msg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
            <button onClick={updatePassword} disabled={loading || !password}
              className="flex items-center gap-2 bg-[#7C9A6E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a7a52] disabled:opacity-50">
              <Save size={14} /> {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
