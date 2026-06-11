'use client'

import Link from 'next/link'
import { Lock, CheckCircle, Circle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { isChapterUnlocked, formatUnlockDate } from '@/lib/utils/chapters'

interface Chapter {
  id: string
  chapter_number: number
  title: string | null
  unlock_date: string | null
}

interface Props {
  bookId: string
  bookName: string
  bookStatus: string
  chapters: Chapter[]
  readIds: Set<string>
  isAdmin: boolean
}

export default function BookDetailClient({ bookId, bookName, bookStatus, chapters, readIds, isAdmin }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div>
        <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">← {t('back_to_books')}</Link>
        <h1 className="text-xl font-bold mt-1">{bookName}</h1>
        {bookStatus === 'archived' && (
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
            {t('program_ended_chapters_available')}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {!chapters.length && (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">{t('no_chapters_yet')}</div>
        )}
        {chapters.map(ch => {
          const unlocked = isAdmin || !ch.unlock_date || isChapterUnlocked(ch.unlock_date)
          const isRead = readIds.has(ch.id)
          const inner = (
            <div className={'flex items-center justify-between rounded-xl border px-4 py-3 ' + (unlocked ? 'bg-card border-border' : 'bg-muted/30 border-border opacity-60')}>
              <div>
                <p className={'font-medium ' + (!unlocked ? 'text-muted-foreground' : '')}>
                  {t('chapter')} {ch.chapter_number}{ch.title ? ' — ' + ch.title : ''}
                </p>
                {!unlocked && ch.unlock_date && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Lock size={11} />{t('unlocks')} {formatUnlockDate(ch.unlock_date)}</p>}
              </div>
              {unlocked && (isRead
                ? <CheckCircle size={20} className="text-primary flex-shrink-0" />
                : <Circle size={20} className="text-muted-foreground flex-shrink-0" />)}
            </div>
          )
          return unlocked
            ? <Link key={ch.id} href={'/books/' + bookId + '/chapters/' + ch.id}>{inner}</Link>
            : <div key={ch.id}>{inner}</div>
        })}
      </div>
    </div>
  )
}
