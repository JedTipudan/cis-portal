'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut, User } from 'lucide-react'

interface Props {
  user: { email?: string } | null
}

export default function TopBar({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Last Updated: {dateStr} &nbsp; {timeStr}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#7C9A6E] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{user.email}</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 ml-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-[#7C9A6E] hover:text-[#5a7a52]"
          >
            <LogIn size={16} /> Admin Login
          </a>
        )}
      </div>
    </header>
  )
}
