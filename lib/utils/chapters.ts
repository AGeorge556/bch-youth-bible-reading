export function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

/** ISO date string comparison is lexicographically correct for YYYY-MM-DD */
export function isChapterUnlocked(unlockDate: string): boolean {
  return unlockDate <= getTodayUTC()
}

export function formatUnlockDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export type BookStatus = 'upcoming' | 'active' | 'completed'

export function getBookStatus(startDate: string | null, endDate: string | null, today?: string): BookStatus {
  const t = today ?? getTodayUTC()
  if (!startDate || !endDate) return 'upcoming'
  if (t < startDate) return 'upcoming'
  if (t > endDate) return 'completed'
  return 'active'
}
