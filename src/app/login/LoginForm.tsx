'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#7C9A6E] flex items-center justify-center mx-auto mb-3">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">CIS Portal – School Report Dashboard</p>
        </div>

        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@school.edu.ph"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A6E]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C9A6E] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#5a7a52] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          <a href="/dashboard" className="text-[#7C9A6E] hover:underline">← Back to Dashboard</a>
        </p>

        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400">
          Department of Education<br />
          Region XI - Davao Region | Division of Davao Oriental
        </div>
      </div>
    </div>
  )
}
