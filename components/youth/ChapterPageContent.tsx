'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import ChapterClient from './ChapterClient'

interface Question { id: string; question_text: string; order_index: number }

interface Props {
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: number
  chapterTitle: string | null
  posterUrl: string | null
  isArchived: boolean
  questions: Question[]
  initialAnswers: Record<string, string>
  isReadInitially: boolean
}

export default function ChapterPageContent({
  bookId, bookName, chapterId, chapterNumber, chapterTitle, posterUrl,
  isArchived, questions, initialAnswers, isReadInitially,
}: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div>
        <Link href={'/books/' + bookId} className="text-sm text-muted-foreground hover:text-foreground">← {bookName}</Link>
        <h1 className="text-xl font-bold mt-1">
          {t('chapter')} {chapterNumber}{chapterTitle ? ' — ' + chapterTitle : ''}
        </h1>
      </div>
      {isArchived ? (
        <div className="space-y-4">
          {posterUrl && (
            <img src={posterUrl} alt="Chapter poster" className="w-full rounded-xl object-contain border border-border bg-muted max-h-80" />
          )}
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
            {t('program_ended_locked')}
          </div>
          {Object.keys(initialAnswers).length > 0 && (
            <div className="rounded-xl bg-card border border-border p-5 space-y-4">
              <h2 className="font-semibold">{t('your_answers')}</h2>
              {questions.map((q, i) => (
                <div key={q.id}>
                  <p className="text-sm font-medium">{i + 1}. {q.question_text}</p>
                  <p className="text-sm text-muted-foreground mt-1">{initialAnswers[q.id] ?? '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ChapterClient chapterId={chapterId} posterUrl={posterUrl}
          questions={questions} initialAnswers={initialAnswers} isReadInitially={isReadInitially} />
      )}
    </div>
  )
}
