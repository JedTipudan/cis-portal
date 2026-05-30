'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'

interface Props {
  user: { email?: string } | null
}

export default function TopBar({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    setDateStr(
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    )
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="bg-white border-b px-4 py-2.5 flex items-center justify-between lg:px-6 lg:py-3 mt-12 lg:mt-0">
      <div className="text-xs text-gray-400 hidden sm:block">
        {dateStr ? `Updated: ${dateStr}` : ''}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#7C9A6E] flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div className="text-xs hidden sm:block">
                <p className="font-semibold text-gray-800 truncate max-w-[120px]">{user.email}</p>
                <p className="text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-1 border border-red-200 px-2 py-1 rounded-lg"
            >
              <LogOut size={13} /> Logout
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="flex items-center gap-1 text-xs font-medium text-white bg-[#7C9A6E] hover:bg-[#5a7a52] px-3 py-1.5 rounded-lg"
          >
            <LogIn size={13} /> Admin Login
          </a>
        )}
      </div>
    </header>
  )
}
