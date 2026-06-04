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
