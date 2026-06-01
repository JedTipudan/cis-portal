'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, School, Users, CalendarCheck, TrendingUp,
  UserCheck, Building2, BookOpen, Handshake, FileText, Eye, Settings, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/school-profile', label: 'School Profile', icon: School },
  { href: '/dashboard/enrollment', label: 'Enrollment', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/dashboard/performance', label: 'Performance', icon: TrendingUp },
  { href: '/dashboard/personnel', label: 'Personnel', icon: UserCheck },
  { href: '/dashboard/facilities', label: 'Facilities & Resources', icon: Building2 },
  { href: '/dashboard/programs', label: 'Programs & Interventions', icon: BookOpen },
  { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: Handshake },
  { href: '/dashboard/reports', label: 'Reports & Documents', icon: FileText },
  { href: '/dashboard/transparency', label: 'Transparency Board', icon: Eye },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
              active
                ? 'bg-[#7C9A6E] text-white font-semibold'
                : 'text-green-100 hover:bg-white/10'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#2d4a3e' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-400">
            <img src="/school-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-white font-bold text-xs leading-tight">CONCEPCION INTEGRATED SCHOOL</p>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full z-50 w-72 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#2d4a3e' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3 mt-0">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-400">
            <img src="/school-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
          <p className="text-white font-bold text-xs leading-tight">CONCEPCION INTEGRATED SCHOOL</p>
            <p className="text-green-300 text-xs mt-0.5">School ID: 502245</p>
          </div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-yellow-300 font-semibold text-sm">Learners Today, Leaders Tomorrow.</p>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col flex-shrink-0" style={{ backgroundColor: '#2d4a3e' }}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-400">
              <img src="/school-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-xs leading-tight">CONCEPCION INTEGRATED SCHOOL</p>
              <p className="text-green-300 text-xs mt-0.5">School ID: 502245</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-5 border-t border-white/10 text-center">
          <p className="text-yellow-300 font-semibold text-sm">Learners Today,</p>
          <p className="text-yellow-300 font-semibold text-sm">Leaders Tomorrow.</p>
        </div>
      </aside>
    </>
  )
}
