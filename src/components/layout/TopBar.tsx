'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, User, ChevronDown, CalendarDays } from 'lucide-react'
import { useSchoolYear } from '@/lib/SchoolYearContext'

interface Props {
  user: { email?: string } | null
}

export default function TopBar({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { schoolYear, setSchoolYear, schoolYears } = useSchoolYear()
  const [dateStr, setDateStr] = useState('')
  const [open, setOpen] = useState(false)

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
    <header className="bg-white border-b px-4 py-2.5 flex items-center justify-between lg:px-6 lg:py-3 mt-12 lg:mt-0 gap-3">
      {/* School Year Selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:border-[#7C9A6E] transition-colors"
        >
          <CalendarDays size={13} className="text-[#7C9A6E]" />
          SY {schoolYear}
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 bg-white border rounded-xl shadow-lg w-40 py-1 max-h-64 overflow-y-auto">
              {schoolYears.map(y => (
                <button
                  key={y}
                  onClick={() => { setSchoolYear(y); setOpen(false); router.refresh() }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${schoolYear === y ? 'font-bold text-[#7C9A6E] bg-green-50' : 'text-gray-700'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="text-xs text-gray-400 hidden sm:block flex-1">
        {dateStr ? `Updated: ${dateStr}` : ''}
      </div>

      <div className="flex items-center gap-2">
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
