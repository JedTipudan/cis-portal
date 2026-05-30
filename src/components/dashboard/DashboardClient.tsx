'use client'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface Props {
  profile: any
  enrollment: any[]
  performance: any[]
  personnel: any[]
  facilities: any[]
  programs: any[]
  transparency: any[]
  achievements: any[]
  needs: any[]
  attendance: any[]
  isAdmin: boolean
}

const COLORS = ['#7C9A6E', '#3B82F6', '#EF4444']

export default function DashboardClient({
  profile, enrollment, performance, personnel, facilities,
  programs, transparency, achievements, needs, attendance, isAdmin
}: Props) {
  const totalEnrollment = enrollment.reduce((s, r) => s + r.male + r.female, 0)
  const totalMale = enrollment.reduce((s, r) => s + r.male, 0)
  const totalFemale = enrollment.reduce((s, r) => s + r.female, 0)

  const lastAttendance = attendance[attendance.length - 1] || { present: 0, absent: 0 }
  const totalStudents = lastAttendance.present + lastAttendance.absent
  const adaRate = totalStudents > 0 ? ((lastAttendance.present / totalStudents) * 100).toFixed(1) : '0'

  const overallMps = performance.length
    ? (performance.reduce((s, r) => s + Number(r.mps), 0) / performance.length).toFixed(1)
    : '0'

  const enrollmentChartData = enrollment.map(r => ({
    name: r.grade_level.replace('Grade ', 'Gr.').replace('Kinder', 'K'),
    total: r.male + r.female,
  }))

  const masteredCount = Math.round(totalEnrollment * 0.35)
  const nearingCount = Math.round(totalEnrollment * 0.45)
  const lowCount = totalEnrollment - masteredCount - nearingCount
  const masteryData = [
    { name: 'Mastered 35%', value: masteredCount },
    { name: 'Nearing Mastery 45%', value: nearingCount },
    { name: 'Low Mastery 20%', value: lowCount },
  ]

  const mooe = transparency.filter(t => t.category === 'MOOE Utilization')
  const projStats = transparency.filter(t => t.category === 'Programs & Projects')
  const procStats = transparency.filter(t => t.category === 'Procurement Summary')

  const teacherRow = (label: string) => personnel.find(p => p.category === label)?.count ?? '-'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">School Report Dashboard</h1>
        <p className="text-gray-500 text-sm">School Year {profile?.school_year || '2024-2025'}</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* School Profile Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border col-span-1 md:col-span-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">School Profile</p>
          <div className="space-y-1 text-xs text-gray-700">
            <p><span className="text-gray-400">District:</span> {profile?.district}</p>
            <p><span className="text-gray-400">Division:</span> {profile?.division}</p>
            <p><span className="text-gray-400">Region:</span> {profile?.region}</p>
            <p><span className="text-gray-400">School Head:</span> {profile?.school_head}</p>
            <p><span className="text-gray-400">Type:</span> {profile?.school_type}</p>
            <p><span className="text-gray-400">Location:</span> {profile?.location}</p>
            <p><span className="text-gray-400">School Year:</span> {profile?.school_year}</p>
          </div>
        </div>

        {/* Total Enrollment */}
        <StatCard
          title="TOTAL ENROLLMENT"
          value={totalEnrollment.toLocaleString()}
          sub={`Male: ${totalMale} (${((totalMale/totalEnrollment)*100).toFixed(2)}%)  Female: ${totalFemale} (${((totalFemale/totalEnrollment)*100).toFixed(2)}%)`}
          href="/dashboard/enrollment"
          color="#3B82F6"
        />

        {/* ADA */}
        <StatCard
          title="AVERAGE DAILY ATTENDANCE"
          value={`${adaRate}%`}
          sub={`Present: ${lastAttendance.present}  Absent: ${lastAttendance.absent}`}
          href="/dashboard/attendance"
          color="#7C9A6E"
        />

        {/* Promotion Rate */}
        <StatCard
          title="PROMOTION RATE"
          value="94.3%"
          sub="Promoted: 1,055  Not Promoted: 64"
          href="/dashboard/performance"
          color="#8B5CF6"
        />

        {/* Completion Rate */}
        <StatCard
          title="COMPLETION RATE"
          value="96.8%"
          sub="Completers: 512  Non-completers: 17"
          href="/dashboard/performance"
          color="#F5C842"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Bar Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border lg:col-span-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Enrollment by Grade Level</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enrollmentChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#7C9A6E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MPS Table */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Performance (MPS)</p>
          <p className="text-xs text-gray-400 mb-3">Mean Percentage Score per Learning Area</p>
          <div className="space-y-2">
            {performance.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 w-36 truncate">{p.subject}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${p.mps}%`, backgroundColor: '#3B82F6' }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{p.mps}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="text-xs font-bold text-gray-700 w-36">OVERALL MPS</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-[#7C9A6E]" style={{ width: `${overallMps}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">{overallMps}</span>
            </div>
          </div>
        </div>

        {/* Mastery Pie */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learner Mastery Level</p>
          <p className="text-xs text-gray-400 mb-2">All Learning Areas</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={masteryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {masteryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Personnel */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Teaching & Non-Teaching Personnel</p>
          <div className="space-y-1.5 text-sm">
            {personnel.map(p => (
              <div key={p.id} className="flex justify-between">
                <span className="text-gray-600">{p.category}</span>
                <span className="font-semibold">{p.count}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/personnel" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">
            View personnel details →
          </Link>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Facilities & Resources</p>
          <div className="space-y-1.5 text-sm">
            {facilities.map(f => (
              <div key={f.id} className="flex justify-between">
                <span className="text-gray-600">{f.name}</span>
                <span className="font-semibold">{f.value}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/facilities" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">
            View all resources →
          </Link>
        </div>

        {/* Programs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Programs & Interventions</p>
          <div className="space-y-2">
            {programs.map(p => (
              <div key={p.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/programs" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">
            View all programs →
          </Link>
        </div>

        {/* Needs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Top Issues & Priority Needs</p>
          <div className="space-y-2">
            {needs.map((n, i) => (
              <div key={n.id} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-[#7C9A6E] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{n.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements + Data Info + Transparency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Achievements */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Recent Achievements & Highlights</p>
          <div className="space-y-2">
            {achievements.map((a, i) => (
              <div key={a.id} className="flex gap-2 items-start">
                <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <span className="text-sm text-gray-700">{a.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Data Information</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2"><span className="text-gray-400">Data Source:</span><span>LIS, EBEIS, School Forms, Manual Records</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Prepared By:</span><span>School Information Unit</span></div>
            <div className="flex gap-2"><span className="text-gray-400">Date Updated:</span><span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
          </div>
        </div>

        {/* Transparency Board */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#7C9A6E]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Transparency Board (Summary)</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {['MOOE Utilization', 'Programs & Projects', 'Procurement Summary'].map(cat => (
              <div key={cat}>
                <p className="font-bold text-gray-600 mb-1">{cat.toUpperCase()}</p>
                {transparency.filter(t => t.category === cat).map(t => (
                  <div key={t.id} className="flex justify-between gap-1">
                    <span className="text-gray-500">{t.label}</span>
                    <span className={`font-semibold ${t.label === 'Balance' ? 'text-[#7C9A6E]' : ''}`}>{t.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Link href="/dashboard/transparency" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">
            View Full Transparency Board →
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, href, color }: {
  title: string; value: string; sub: string; href: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mb-3">{sub}</p>
      <Link href={href} className="text-xs text-[#7C9A6E] hover:underline">View details →</Link>
    </div>
  )
}
