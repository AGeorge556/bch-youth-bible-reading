'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Book { id: string; name: string; status: string }

interface Props {
  activeBooks: Book[]
  archivedBooks: Book[]
}

export default function BooksPageClient({ activeBooks, archivedBooks }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">{t('books')}</h1>

      {activeBooks.length === 0 && archivedBooks.length === 0 && (
        <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">
          {t('no_books_available')}
        </div>
      )}

      {activeBooks.length > 0 && (
        <section className="space-y-2">
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

      {archivedBooks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('past_programs')}</h2>
          {archivedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl bg-card border border-border p-4 hover:bg-muted transition-colors"
            >
              <span className="font-medium text-foreground">{book.name}</span>
              <span className="text-xs text-muted-foreground">{t('archived')}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
