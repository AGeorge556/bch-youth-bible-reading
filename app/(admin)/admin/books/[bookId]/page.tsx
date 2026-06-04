import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookForm from '@/components/admin/BookForm'
import ChapterDeleteButton from '@/components/admin/ChapterDeleteButton'
import Link from 'next/link'

export default async function AdminBookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('id,name,status,display_order').eq('id', bookId).single()
  if (!book) notFound()
  const { data: chapters } = await supabase.from('chapters')
    .select('id,chapter_number,title,unlock_date').eq('book_id', bookId).order('chapter_number')

  return (
    <div className="max-w-4xl space-y-8 pt-14 md:pt-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/books" className="hover:text-foreground">Books</Link>
        <span>/</span>
        <span>{book.name}</span>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Book</h2>
        <BookForm mode="edit" book={book} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chapters ({chapters?.length ?? 0})</h2>
          <Link href={'/admin/books/' + bookId + '/chapters/new'}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            + Add Chapter
          </Link>
        </div>
        {!chapters?.length && (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">
            No chapters yet.
          </div>
        )}
        <div className="space-y-2">
          {chapters?.map(ch => (
            <div key={ch.id} className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
              <div>
                <span className="font-medium">Chapter {ch.chapter_number}</span>
                {ch.title && <span className="ml-2 text-sm text-muted-foreground">- {ch.title}</span>}
                <p className="text-xs text-muted-foreground mt-0.5">Unlocks: {ch.unlock_date}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href={'/admin/books/' + bookId + '/chapters/' + ch.id + '/edit'} className="text-sm text-primary hover:underline">Edit</Link>
                <ChapterDeleteButton bookId={bookId} chapterId={ch.id} chapterNumber={ch.chapter_number} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}