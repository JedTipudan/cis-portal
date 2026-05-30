'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, School, Users, CalendarCheck, TrendingUp,
  UserCheck, Building2, BookOpen, Handshake, FileText, Eye, Settings
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

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#2d4a3e' }}>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-green-900 font-bold text-lg flex-shrink-0">
            S
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-tight">INTEGRATED NATIONAL HIGH SCHOOL</p>
            <p className="text-green-300 text-xs mt-0.5">School ID: 108912</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
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
      </nav>

      {/* Bottom */}
      <div className="p-5 border-t border-white/10">
        <div className="text-center">
          <p className="text-yellow-300 font-semibold text-sm">Learners Today,</p>
          <p className="text-yellow-300 font-semibold text-sm">Leaders Tomorrow.</p>
        </div>
      </div>
    </aside>
  )
}
