import { createClient } from '@/lib/supabase/server'
import { getBookStatus, getTodayUTC } from '@/lib/utils/chapters'
import Link from 'next/link'

export default async function AdminBooksPage() {
  const supabase = await createClient()
  const today = getTodayUTC()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, start_date, end_date')
    .order('start_date', { ascending: true, nullsFirst: false })

  return (
    <div className="max-w-4xl space-y-6 pt-14 md:pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link
          href="/admin/books/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          + New Book
        </Link>
      </div>

      <div className="space-y-2">
        {!books?.length && (
          <div className="rounded-xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
            No books yet. Create your first book to get started.
          </div>
        )}
        {books?.map((book) => {
          const status = getBookStatus(book.start_date, book.end_date, today)
          return (
            <div key={book.id} className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-medium truncate">{book.name}</span>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                  status === 'active' ? 'bg-green-100 text-green-700' :
                  status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {status}
                </span>
                {book.start_date && (
                  <span className="shrink-0 text-xs text-muted-foreground hidden sm:inline">
                    {book.start_date} → {book.end_date ?? '?'}
                  </span>
                )}
              </div>
              <Link href={`/admin/books/${book.id}`} className="shrink-0 text-sm text-primary hover:underline ml-4">
                Manage
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
