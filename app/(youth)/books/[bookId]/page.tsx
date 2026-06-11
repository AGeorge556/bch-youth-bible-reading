import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookDetailClient from '@/components/youth/BookDetailClient'

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: book }, { data: chapters }, { data: progress }, { data: profile }] = await Promise.all([
    supabase.from('books').select('id,name,status').eq('id', bookId).single(),
    supabase.from('chapters').select('id,chapter_number,title,unlock_date').eq('book_id', bookId).order('chapter_number'),
    supabase.from('reading_progress').select('chapter_id').eq('user_id', user!.id),
    supabase.from('profiles').select('role').eq('id', user!.id).single(),
  ])

  if (!book) notFound()

  return (
    <BookDetailClient
      bookId={bookId}
      bookName={book.name}
      bookStatus={book.status}
      chapters={chapters ?? []}
      readIds={new Set(progress?.map(r => r.chapter_id) ?? [])}
      isAdmin={profile?.role === 'admin'}
    />
  )
}
