'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

function generateSchoolYears() {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current + 1; y >= 2023; y--) {
    years.push(`${y}-${y + 1}`)
  }
  return years
}

const SCHOOL_YEARS = generateSchoolYears()

export function isTermBased(schoolYear: string): boolean {
  const startYear = parseInt(schoolYear.split('-')[0])
  return startYear >= 2026
}

export function getTermsOrQuarters(schoolYear: string): { label: string; value: string }[] {
  if (isTermBased(schoolYear)) {
    return [
      { label: 'Term 1', value: 'Term 1' },
      { label: 'Term 2', value: 'Term 2' },
      { label: 'Term 3', value: 'Term 3' },
    ]
  }
  return [
    { label: 'Quarter 1', value: 'Term 1' },
    { label: 'Quarter 2', value: 'Term 2' },
    { label: 'Quarter 3', value: 'Term 3' },
    { label: 'Quarter 4', value: 'Term 4' },
  ]
}

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
