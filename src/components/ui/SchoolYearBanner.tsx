'use client'
import { useSchoolYear } from '@/lib/SchoolYearContext'
import { CalendarDays } from 'lucide-react'

export default function SchoolYearBanner() {
  const { schoolYear } = useSchoolYear()
  return (
    <div className="flex items-center gap-2 mb-4 bg-[#7C9A6E]/10 border border-[#7C9A6E]/30 rounded-lg px-3 py-2 w-fit">
      <CalendarDays size={14} className="text-[#7C9A6E]" />
      <span className="text-xs font-semibold text-[#7C9A6E]">Viewing: School Year {schoolYear}</span>
    </div>
  )
}
