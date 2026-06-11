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
      <button
        type="button"
        disabled={isRead || pending}
        onClick={() => {
          if (!isRead && !pending) {
            const syntheticEvent = { target: { checked: true } } as React.ChangeEvent<HTMLInputElement>
            handleChange(syntheticEvent)
          }
        }}
        className={
          isRead
            ? 'w-full rounded-2xl px-5 py-3 text-sm font-bold text-white bg-green-500 flex items-center justify-center gap-2 transition-all'
            : pending
            ? 'w-full rounded-2xl px-5 py-3 text-sm font-bold text-white opacity-70 flex items-center justify-center gap-2 btn-gradient'
            : 'w-full rounded-2xl px-5 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 btn-gradient hover:opacity-90 active:scale-[0.98] transition-all shadow-md'
        }
      >
        {isRead ? (
          <><span className="text-lg">✓</span> Chapter read!</>
        ) : pending ? (
          'Saving…'
        ) : (
          <><span className="text-base">📖</span> I read this! ✓</>
        )}
      </button>
      <input type="checkbox" checked={isRead} onChange={handleChange} disabled={isRead || pending} className="hidden" aria-hidden="true" />
      {badge && (
        <div className="rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1.5px solid #f59e0b', color: '#92400e' }}>
          🏆 Amazing! You finished <strong>{badge}</strong> and earned the Finished Book badge!
        </div>
      )}
    </div>
  )
}