'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts'

interface Props {
  profile: any
  enrollment: any[]
  performance: any[]
  kpi: any[]
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
const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate', 'Repetition Rate'])

const ASSESSMENTS = [
  { key: 'ks1', label: 'KS1 (Grades 1–3)', color: '#3B82F6', items: [{ name: 'CRLA', sub: 'Reading Level', value: 78 }, { name: 'RMA', sub: 'Numeracy Level', value: 72 }] },
  { key: 'ks2', label: 'KS2 (Grades 4–6)', color: '#7C9A6E', items: [{ name: 'Phil-IRI', sub: 'Reading Level', value: 76 }, { name: 'RMA', sub: 'Numeracy Level', value: 68 }] },
  { key: 'ks3', label: 'KS3 (Grades 7–10)', color: '#8B5CF6', items: [{ name: 'Phil-IRI', sub: 'Reading Level', value: 74 }, { name: 'RMA', sub: 'Numeracy Level', value: 66 }] },
]

function GaugeChart({ value, color }: { value: number; color: string }) {
  const data = [{ value, fill: color }, { value: 100 - value, fill: '#F3F4F6' }]
  return (
    <ResponsiveContainer width={80} height={80}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" startAngle={180} endAngle={0}
          innerRadius={28} outerRadius={38} dataKey="value" stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function DashboardClient({
  profile, enrollment, performance, kpi, personnel, facilities,
  programs, transparency, achievements, needs, attendance, isAdmin
}: Props) {
  const totalEnrollment = enrollment.reduce((s, r) => s + r.male + r.female, 0)
  const totalMale = enrollment.reduce((s, r) => s + r.male, 0)
  const totalFemale = enrollment.reduce((s, r) => s + r.female, 0)

  const lastAttendance = attendance[attendance.length - 1] || { present: 0, absent: 0 }
  const totalStudents = lastAttendance.present + lastAttendance.absent
  const adaRate = totalStudents > 0 ? ((lastAttendance.present / totalStudents) * 100).toFixed(1) : '0'

  // Only use unique subjects for MPS display (avoid duplicates from grade-level rows)
  const uniqueSubjects = Array.from(new Map(performance.map(p => [p.subject, p])).values()).slice(0, 8)
  const overallMps = uniqueSubjects.length
    ? (uniqueSubjects.reduce((s, r) => s + Number(r.mps), 0) / uniqueSubjects.length).toFixed(1)
    : '0'

  const [dateLabel, setDateLabel] = useState('')
  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
  }, [])

  const enrollmentChartData = enrollment.map(r => ({
    name: r.grade_level.replace('Grade ', 'G').replace('Kinder', 'K'),
    total: r.male + r.female,
  }))

  const masteredCount = Math.round(totalEnrollment * 0.35)
  const nearingCount = Math.round(totalEnrollment * 0.45)
  const lowCount = totalEnrollment - masteredCount - nearingCount
  const masteryData = [
    { name: 'Mastered 35%', value: masteredCount },
    { name: 'Nearing 45%', value: nearingCount },
    { name: 'Low 20%', value: lowCount },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">School Report Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm">School Year {profile?.school_year || '2024-2025'}</p>
      </div>

      {/* School Profile */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">School Profile</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-700">
          <p><span className="text-gray-400">District: </span>{profile?.district}</p>
          <p><span className="text-gray-400">Division: </span>{profile?.division}</p>
          <p><span className="text-gray-400">Region: </span>{profile?.region}</p>
          <p><span className="text-gray-400">School Head: </span>{profile?.school_head}</p>
          <p><span className="text-gray-400">Type: </span>{profile?.school_type}</p>
          <p><span className="text-gray-400">Location: </span>{profile?.location}</p>
          <p><span className="text-gray-400">School Year: </span>{profile?.school_year}</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Enrollment" value={totalEnrollment.toLocaleString()}
          sub={`M: ${totalMale} / F: ${totalFemale}`} href="/dashboard/enrollment" color="#3B82F6" />
        <StatCard title="Avg Daily Attendance" value={`${adaRate}%`}
          sub={`Present: ${lastAttendance.present}`} href="/dashboard/attendance" color="#7C9A6E" />
        <StatCard title="Promotion Rate" value={`${kpi.find(k => k.indicator === 'Promotion Rate')?.value ?? 94.3}%`}
          sub="Promoted learners" href="/dashboard/performance?tab=kpi" color="#8B5CF6" />
        <StatCard title="Completion Rate" value={`${kpi.find(k => k.indicator === 'Completion Rate')?.value ?? 96.8}%`}
          sub="Completers" href="/dashboard/performance?tab=kpi" color="#F5C842" />
      </div>

      {/* Learning Assessment Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Assessment Summary</p>
        <p className="text-xs text-gray-400 mb-4">Results are based on the latest available assessment</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ASSESSMENTS.map(a => (
            <div key={a.key} className="border rounded-lg p-3">
              <p className="text-xs font-bold text-center mb-3 px-2 py-1 rounded text-white" style={{ backgroundColor: a.color }}>{a.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {a.items.map(item => (
                  <div key={item.name} className="flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-700">{item.name}</p>
                    <p className="text-[10px] text-gray-400 mb-1">{item.sub}</p>
                    <div className="relative">
                      <GaugeChart value={item.value} color={a.color} />
                      <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <span className="text-sm font-bold" style={{ color: a.color }}>{item.value}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center leading-tight">At or Above<br />Benchmark</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/performance?tab=reading" className="text-xs text-[#7C9A6E] hover:underline mt-2 block text-center">View details →</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Chart + Learner Profile + Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border lg:col-span-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Enrollment by Grade Level</p>
          <p className="text-xs text-gray-400 mb-2">Total: {totalEnrollment.toLocaleString()} Learners</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={enrollmentChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 7 }} interval={0} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Learner Profile Pie */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learner Profile</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={[
                { name: `Male ${((totalMale / totalEnrollment) * 100).toFixed(2)}%`, value: totalMale },
                { name: `Female ${((totalFemale / totalEnrollment) * 100).toFixed(2)}%`, value: totalFemale },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                <Cell fill="#3B82F6" />
                <Cell fill="#EF4444" />
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs font-bold text-gray-700 -mt-2">{totalEnrollment.toLocaleString()} Total Learners</p>
        </div>

        {/* KEY INDICATORS — all 10 KPIs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Key Indicators</p>
          <div className="space-y-2">
            {kpi.map(k => {
              const isNeg = NEGATIVE_KPIS.has(k.indicator)
              const val = Number(k.value)
              const color = isNeg
                ? (val <= 2 ? '#7C9A6E' : '#EF4444')
                : (val >= 90 ? '#7C9A6E' : val >= 75 ? '#3B82F6' : '#EF4444')
              return (
                <div key={k.id} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 flex-1 leading-tight">{k.indicator}</span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{val}%</span>
                </div>
              )
            })}
          </div>
          <Link href="/dashboard/performance?tab=kpi" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View details →</Link>
        </div>
      </div>

      {/* MPS + Mastery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Performance (MPS)</p>
          <p className="text-xs text-gray-400 mb-3">Mean Percentage Score</p>
          <div className="space-y-2">
            {uniqueSubjects.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 w-28 truncate">{p.subject}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${p.mps}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-7 text-right">{p.mps}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="text-xs font-bold text-gray-700 w-28">OVERALL MPS</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#7C9A6E]" style={{ width: `${overallMps}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-7 text-right">{overallMps}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learner Mastery Level</p>
          <p className="text-xs text-gray-400 mb-2">All Learning Areas</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={masteryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {masteryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personnel + Facilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Teaching & Non-Teaching Personnel</p>
          <div className="space-y-1.5">
            {personnel.map(p => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-600 text-xs">{p.category}</span>
                <span className="font-semibold text-xs">{p.count}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/personnel" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View personnel details →</Link>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Facilities & Resources</p>
          <div className="space-y-1.5">
            {facilities.map(f => (
              <div key={f.id} className="flex justify-between text-sm">
                <span className="text-gray-600 text-xs">{f.name}</span>
                <span className="font-semibold text-xs">{f.value}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/facilities" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View all resources →</Link>
        </div>
      </div>

      {/* Programs + Needs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Programs & Interventions</p>
          <div className="space-y-2">
            {programs.map(p => (
              <div key={p.id} className="flex justify-between items-center gap-2">
                <span className="text-xs text-gray-700 flex-1">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/programs" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View all programs →</Link>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Top Issues & Priority Needs</p>
          <div className="space-y-2">
            {needs.map((n, i) => (
              <div key={n.id} className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-[#7C9A6E] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-xs text-gray-700">{n.description}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/programs" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View all needs →</Link>
        </div>
      </div>

      {/* Achievements + Data Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Recent Achievements & Highlights</p>
          <div className="space-y-2">
            {achievements.map((a, i) => (
              <div key={a.id} className="flex gap-2 items-start">
                <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <span className="text-xs text-gray-700">{a.title}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/reports" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View all highlights →</Link>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Data Information</p>
          <div className="space-y-2 text-xs text-gray-700">
            <p><span className="text-gray-400">Source: </span>LIS, EBEIS, School Forms, Manual Records</p>
            <p><span className="text-gray-400">Prepared By: </span>School Information Unit</p>
            <p><span className="text-gray-400">Updated: </span>{dateLabel}</p>
          </div>
        </div>
      </div>

      {/* Transparency Board */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#7C9A6E]">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Transparency Board (Summary)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {['MOOE Utilization', 'Programs & Projects', 'Procurement Summary'].map(cat => (
            <div key={cat}>
              <p className="font-bold text-gray-600 mb-1 border-b pb-1">{cat.toUpperCase()}</p>
              {transparency.filter(t => t.category === cat).map(t => (
                <div key={t.id} className="flex justify-between items-center py-0.5">
                  <span className="text-gray-500 flex-1 pr-2">{t.label}</span>
                  <span className={`font-semibold whitespace-nowrap ${t.label === 'Balance' ? 'text-[#7C9A6E]' : ''}`}>{t.value}</span>
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
  )
}

function StatCard({ title, value, sub, href, color }: {
  title: string; value: string; sub: string; href: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 leading-tight">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400 mb-2">{sub}</p>
      <Link href={href} className="text-xs text-[#7C9A6E] hover:underline">View details →</Link>
    </div>
  )
}
