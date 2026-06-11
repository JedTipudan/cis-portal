'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const SCHOOL_YEARS = [
  '2025-2026', '2024-2025', '2023-2024',
]

const KEY = 'cis_school_year'

interface Ctx { schoolYear: string; setSchoolYear: (y: string) => void; schoolYears: string[] }
const SchoolYearContext = createContext<Ctx>({ schoolYear: '2024-2025', setSchoolYear: () => {}, schoolYears: SCHOOL_YEARS })

export function SchoolYearProvider({ children }: { children: ReactNode }) {
  const [schoolYear, setSchoolYearState] = useState('2024-2025')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved && SCHOOL_YEARS.includes(saved)) setSchoolYearState(saved)
  }, [])

  function setSchoolYear(y: string) {
    setSchoolYearState(y)
    localStorage.setItem(KEY, y)
  }

  return (
    <SchoolYearContext.Provider value={{ schoolYear, setSchoolYear, schoolYears: SCHOOL_YEARS }}>
      {children}
    </SchoolYearContext.Provider>
  )
}

export const useSchoolYear = () => useContext(SchoolYearContext)
