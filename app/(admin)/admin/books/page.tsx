import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminBooksPage() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, status, display_order')
    .order('display_order')

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
        {books?.map((book) => (
          <div key={book.id} className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">{book.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${book.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {book.status}
              </span>
            </div>
            <Link href={`/admin/books/${book.id}`} className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
