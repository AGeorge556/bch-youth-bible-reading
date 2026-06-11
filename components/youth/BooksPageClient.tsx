'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { BookStatus } from '@/lib/utils/chapters'

interface BookWithStatus {
  id: string
  name: string
  bookStatus: BookStatus
  start_date: string | null
  end_date: string | null
}

interface Props {
  activeBooks: BookWithStatus[]
  upcomingBooks: BookWithStatus[]
  completedBooks: BookWithStatus[]
}

export default function BooksPageClient({ activeBooks, upcomingBooks, completedBooks }: Props) {
  const { t } = useLanguage()
  const hasBooks = activeBooks.length > 0 || upcomingBooks.length > 0 || completedBooks.length > 0

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">{t('books')}</h1>

      {!hasBooks && (
        <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">
          {t('no_books_available')}
        </div>
      )}

      {activeBooks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('active')}</h2>
          {activeBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-4 hover:bg-primary/10 transition-colors"
            >
              <span className="font-medium text-foreground">{book.name}</span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{t('active')}</span>
            </Link>
          ))}
        </section>
      )}

      {upcomingBooks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('upcoming')}</h2>
          {upcomingBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl bg-card border border-border p-4 hover:bg-muted transition-colors opacity-70"
            >
              <span className="font-medium text-foreground">{book.name}</span>
              <span className="text-xs border border-border text-muted-foreground px-2 py-0.5 rounded-full">{t('upcoming')}</span>
            </Link>
          ))}
        </section>
      )}

      {completedBooks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('past_programs')}</h2>
          {completedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl bg-card border border-border p-4 hover:bg-muted transition-colors"
            >
              <span className="font-medium text-foreground">{book.name}</span>
              <span className="text-xs text-muted-foreground">{t('completed')}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
