const GRADE_ORDER: Record<string, number> = {
  'Kinder': 0,
  'Grade 1': 1,
  'Grade 2': 2,
  'Grade 3': 3,
  'Grade 4': 4,
  'Grade 5': 5,
  'Grade 6': 6,
  'Grade 7': 7,
  'Grade 8': 8,
  'Grade 9': 9,
  'Grade 10': 10,
}

export function sortEnrollment(data: any[]) {
  return [...data].sort((a, b) => {
    const aOrder = GRADE_ORDER[a.grade_level] ?? 99
    const bOrder = GRADE_ORDER[b.grade_level] ?? 99
    return aOrder - bOrder
  })
}
