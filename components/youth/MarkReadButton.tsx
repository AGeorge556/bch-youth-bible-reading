'use client'
import { useState } from 'react'
import { markChapterRead, type MarkChapterReadResult } from '@/lib/actions/reading'

interface Props { chapterId: string; isReadInitially: boolean }

export default function MarkReadButton({ chapterId, isReadInitially }: Props) {
  const [isRead, setIsRead] = useState(isReadInitially)
  const [pending, setPending] = useState(false)
  const [badge, setBadge] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.checked || isRead) return
    setIsRead(true); setPending(true)
    try {
      const result: MarkChapterReadResult = await markChapterRead(chapterId)
      if (!result.success) { setIsRead(false); return }
      if (result.badgeAwarded) setBadge(result.bookName)
    } catch { setIsRead(false) } finally { setPending(false) }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={isRead} onChange={handleChange} disabled={isRead || pending}
          className="w-5 h-5 rounded border-2 border-primary accent-primary cursor-pointer disabled:cursor-default" />
        <span className="text-sm font-medium">{isRead ? 'Chapter read!' : pending ? 'Saving…' : 'I have read this chapter'}</span>
      </label>
      {badge && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Congratulations! You finished <strong>{badge}</strong> and earned the Finished Book badge!
        </div>
      )}
    </div>
  )
}