import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BooksPage() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, status')
    .order('display_order')

  const activeBooks = books?.filter((b) => b.status === 'active') ?? []
  const archivedBooks = books?.filter((b) => b.status === 'archived') ?? []

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Books</h1>

      {activeBooks.length === 0 && archivedBooks.length === 0 && (
        <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">
          No books available yet.
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
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>
            </Link>
          ))}
        </section>
      )}

      {archivedBooks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past Programs</h2>
          {archivedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl bg-card border border-border p-4 hover:bg-muted transition-colors"
            >
              <span className="font-medium text-foreground">{book.name}</span>
              <span className="text-xs text-muted-foreground">Archived</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
