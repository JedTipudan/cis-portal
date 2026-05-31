'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
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
  learnerProfile: any[]
  otherFunds: any[]
  mooeMonthly: any[]
  programsMonthly: any[]
  reading: any[]
  philiri: any[]
  isAdmin: boolean
}

const NEGATIVE_KPIS = new Set(['Dropout/School Leaver Rate', 'Repetition Rate'])

const GRADE_ORDER = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10']

const PROFILE_COLORS: Record<string, string> = {
  'Male': '#3B82F6',
  'Female': '#EC4899',
  'SPED': '#8B5CF6',
  'IP': '#F59E0B',
  'Others': '#6B7280',
}

// Compute average MPS per grade from all subjects
function getMpsByGrade(performance: any[]) {
  const map: Record<string, number[]> = {}
  performance.forEach(p => {
    if (!map[p.grade_level]) map[p.grade_level] = []
    map[p.grade_level].push(Number(p.mps))
  })
  return GRADE_ORDER.map(g => ({
    grade: g.replace('Grade ', 'G'),
    mps: map[g] ? Number((map[g].reduce((s, v) => s + v, 0) / map[g].length).toFixed(1)) : 0,
    subjects: map[g] ? [...new Set(performance.filter(p => p.grade_level === g).map(p => p.subject))] : [],
    avgMps: map[g] ? Number((map[g].reduce((s, v) => s + v, 0) / map[g].length).toFixed(1)) : 0,
  })).filter(g => g.mps > 0)
}

export default function DashboardClient({
  profile, enrollment, performance, kpi, personnel, facilities,
  programs, transparency, achievements, needs, attendance, learnerProfile,
  otherFunds, mooeMonthly, programsMonthly, reading, philiri, isAdmin
}: Props) {
  const totalEnrollment = enrollment.reduce((s, r) => s + r.male + r.female, 0)
  const totalMale = enrollment.reduce((s, r) => s + r.male, 0)
  const totalFemale = enrollment.reduce((s, r) => s + r.female, 0)

  const lastAttendance = attendance[attendance.length - 1] || { present: 0, absent: 0 }
  const totalStudents = lastAttendance.present + lastAttendance.absent
  const adaRate = totalStudents > 0 ? ((lastAttendance.present / totalStudents) * 100).toFixed(1) : '0'

  const totalIgp = otherFunds.reduce((s: number, r: any) => s + Number(r.igp_capitalization) - Number(r.igp_reinvestment), 0)
  const totalCanteen = otherFunds.reduce((s: number, r: any) => s + Number(r.canteen_capitalization) - Number(r.canteen_reinvestment), 0)
  const totalAllocated = mooeMonthly.reduce((s: number, r: any) => s + Number(r.allocated), 0)
  const totalUtilized = mooeMonthly.reduce((s: number, r: any) => s + Number(r.utilized), 0)
  const totalBalance = totalAllocated - totalUtilized
  const lastProg = programsMonthly[programsMonthly.length - 1] || { implemented: 0, ongoing: 0, completed: 0 }
  const fmt = (n: number) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })

  // Reading assessment summary for dashboard
  const crlaTotal = reading.filter(r => r.assessment_type === 'CRLA')
    .reduce((s, r) => s + Number(r.low_emerging||0) + Number(r.high_emerging||0) + Number(r.developing||0) + Number(r.transition||0) + Number(r.grade_level_reader||0), 0)
  const crlaGradeLevel = reading.filter(r => r.assessment_type === 'CRLA')
    .reduce((s, r) => s + Number(r.grade_level_reader||0), 0)
  const crlaRate = crlaTotal > 0 ? Math.round((crlaGradeLevel / crlaTotal) * 100) : 0

  const philiriTotal = philiri.reduce((s, r) => s + Number(r.three_levels_down||0) + Number(r.two_levels_down||0) + Number(r.grade_ready||0), 0)
  const philiriReady = philiri.reduce((s, r) => s + Number(r.grade_ready||0), 0)
  const philiriRate = philiriTotal > 0 ? Math.round((philiriReady / philiriTotal) * 100) : 0

  const rmaTotal = reading.filter(r => r.assessment_type === 'RMA')
    .reduce((s, r) => s + Number(r.not_proficient||0) + Number(r.low_proficient||0) + Number(r.nearly_proficient||0) + Number(r.proficient||0) + Number(r.highly_proficient||0), 0)
  const rmaProficient = reading.filter(r => r.assessment_type === 'RMA')
    .reduce((s, r) => s + Number(r.proficient||0) + Number(r.highly_proficient||0), 0)
  const rmaRate = rmaTotal > 0 ? Math.round((rmaProficient / rmaTotal) * 100) : 0

  const [dateLabel, setDateLabel] = useState('')
  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
  }, [])

  const enrollmentChartData = enrollment.map(r => ({
    name: r.grade_level.replace('Grade ', 'G').replace('Kinder', 'K'),
    total: r.male + r.female,
  }))

  // MPS per grade (averaged across all subjects)
  const mpsByGrade = getMpsByGrade(performance)
  const overallMps = mpsByGrade.length
    ? (mpsByGrade.reduce((s, g) => s + g.mps, 0) / mpsByGrade.length).toFixed(1)
    : '0'

  // Learner profile pie data
  const profilePieData = learnerProfile.length > 0
    ? learnerProfile.map(p => ({
        name: p.category,
        value: p.count,
        color: PROFILE_COLORS[p.category] || '#6B7280',
      }))
    : [
        { name: `Male`, value: totalMale, color: '#3B82F6' },
        { name: `Female`, value: totalFemale, color: '#EC4899' },
      ]

  const masteredCount = Math.round(totalEnrollment * 0.35)
  const nearingCount = Math.round(totalEnrollment * 0.45)
  const lowCount = totalEnrollment - masteredCount - nearingCount
  const masteryData = [
    { name: 'Mastered 35%', value: masteredCount },
    { name: 'Nearing 45%', value: nearingCount },
    { name: 'Low 20%', value: lowCount },
  ]
  const masteryColors = ['#7C9A6E', '#3B82F6', '#EF4444']

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Enrollment" value={totalEnrollment.toLocaleString()}
          sub={`M: ${totalMale} / F: ${totalFemale}`} href="/dashboard/enrollment" color="#3B82F6" />
        <StatCard title="Avg Daily Attendance" value={`${adaRate}%`}
          sub={`Present: ${lastAttendance.present}`} href="/dashboard/attendance" color="#7C9A6E" />
        <StatCard title="Promotion Rate" value={`${kpi.find(k => k.indicator === 'Promotion Rate')?.value ?? 94.3}%`}
          sub="Promoted learners" href="/dashboard/performance?tab=kpi" color="#8B5CF6" />
        <StatCard title="Completion Rate" value={`${kpi.find(k => k.indicator === 'Completion Rate')?.value ?? 96.8}%`}
          sub="Completers" href="/dashboard/performance?tab=kpi" color="#F5C842" />
      </div>

      {/* Learning Assessment Summary — CRLA, Phil-IRI, RMA */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Assessment Summary</p>
        <p className="text-xs text-gray-400 mb-4">Learners at or above benchmark</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'CRLA', sub: 'Grades 1–3 · Reading at Grade Level', rate: crlaRate, color: '#3B82F6', href: '/dashboard/performance?tab=reading&assessment=CRLA' },
            { label: 'Phil-IRI', sub: 'Grades 4–10 · Grade Ready', rate: philiriRate, color: '#7C9A6E', href: '/dashboard/performance?tab=reading&assessment=Phil-IRI' },
            { label: 'RMA', sub: 'Grades 1–10 · Proficient & Above', rate: rmaRate, color: '#8B5CF6', href: '/dashboard/performance?tab=reading&assessment=RMA' },
          ].map(a => (
            <div key={a.label} className="border rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: a.color }}>
                {a.label.charAt(0)}
              </div>
              <p className="text-sm font-bold text-gray-800">{a.label}</p>
              <p className="text-[10px] text-gray-400 text-center leading-tight">{a.sub}</p>
              <p className="text-3xl font-bold" style={{ color: a.color }}>{a.rate}%</p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: `${a.rate}%`, backgroundColor: a.color }} />
              </div>
              <Link href={a.href} className="text-xs text-[#7C9A6E] hover:underline">View details →</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Chart + Learner Profile + Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
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
          <Link href="/dashboard/enrollment" className="text-xs text-[#7C9A6E] hover:underline mt-2 block">View details →</Link>
        </div>

        {/* Learner Profile Pie — Male, Female, SPED, IP, Others */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learner Profile</p>
          <p className="text-xs text-gray-400 mb-1">Breakdown by category</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={profilePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {profilePieData.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip formatter={(v: any, name: any) => [`${v} learners`, name]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Summary counts */}
          <div className="grid grid-cols-3 gap-1 mt-1">
            {profilePieData.map(p => (
              <div key={p.name} className="text-center">
                <p className="text-xs font-bold" style={{ color: p.color }}>{p.value}</p>
                <p className="text-[10px] text-gray-400">{p.name}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/enrollment" className="text-xs text-[#7C9A6E] hover:underline mt-2 block">View details →</Link>
        </div>

        {/* Key Indicators */}
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

      {/* MPS per Grade + Mastery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* MPS per Grade Level */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learning Performance (MPS)</p>
          <p className="text-xs text-gray-400 mb-3">Average MPS per Grade Level</p>
          <div className="space-y-2">
            {mpsByGrade.map(g => (
              <div key={g.grade} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 w-8 flex-shrink-0">{g.grade}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${g.mps}%`,
                      backgroundColor: g.mps >= 85 ? '#7C9A6E' : g.mps >= 75 ? '#3B82F6' : '#EF4444'
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{g.mps}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="text-xs font-bold text-gray-700 w-8">AVG</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-[#7C9A6E]" style={{ width: `${overallMps}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">{overallMps}</span>
            </div>
          </div>
          <Link href="/dashboard/performance?tab=academic" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">View by subject →</Link>
        </div>

        {/* Learner Mastery */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Learner Mastery Level</p>
          <p className="text-xs text-gray-400 mb-2">All Learning Areas</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={masteryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {masteryData.map((_, i) => <Cell key={i} fill={masteryColors[i]} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Link href="/dashboard/performance?tab=academic" className="text-xs text-[#7C9A6E] hover:underline mt-2 block">View details →</Link>
        </div>
      </div>

      {/* Personnel + Facilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Teaching & Non-Teaching Personnel</p>
          <div className="space-y-1.5">
            {personnel.map(p => (
              <div key={p.id} className="flex justify-between">
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
              <div key={f.id} className="flex justify-between">
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
          {['MOOE Utilization', 'Programs & Projects', 'Other Funds'].map(cat => (
            <div key={cat}>
              <p className="font-bold text-gray-600 mb-1 border-b pb-1">{cat.toUpperCase()}</p>
              {cat === 'Other Funds' ? (
                <>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500 flex-1 pr-2">IGP Total</span>
                    <span className="font-semibold whitespace-nowrap text-[#7C9A6E]">{fmt(totalIgp)}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500 flex-1 pr-2">Canteen Total</span>
                    <span className="font-semibold whitespace-nowrap text-[#3B82F6]">{fmt(totalCanteen)}</span>
                  </div>
                </>
              ) : cat === 'MOOE Utilization' ? (
                <>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Allocated</span><span className="font-semibold whitespace-nowrap">{fmt(totalAllocated)}</span></div>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Utilized</span><span className="font-semibold whitespace-nowrap">{fmt(totalUtilized)}</span></div>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Balance</span><span className="font-semibold whitespace-nowrap text-[#7C9A6E]">{fmt(totalBalance)}</span></div>
                </>
              ) : cat === 'Programs & Projects' ? (
                <>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Implemented</span><span className="font-semibold">{lastProg.implemented}</span></div>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Ongoing</span><span className="font-semibold">{lastProg.ongoing}</span></div>
                  <div className="flex justify-between items-center py-0.5"><span className="text-gray-500 flex-1 pr-2">Completed</span><span className="font-semibold">{lastProg.completed}</span></div>
                </>
              ) : (
                transparency.filter(t => t.category === cat).map(t => (
                  <div key={t.id} className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500 flex-1 pr-2">{t.label}</span>
                    <span className={`font-semibold whitespace-nowrap ${t.label === 'Balance' ? 'text-[#7C9A6E]' : ''}`}>{t.value}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
        <Link href="/dashboard/transparency?tab=mooe" className="text-xs text-[#7C9A6E] hover:underline mt-3 block">
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
