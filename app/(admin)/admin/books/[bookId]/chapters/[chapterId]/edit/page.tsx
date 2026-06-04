import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChapterForm from '@/components/admin/ChapterForm'
import Link from 'next/link'
export default async function EditChapterPage({ params }: { params: Promise<{ bookId: string; chapterId: string }> }) {
  const { bookId, chapterId } = await params
  const supabase = await createClient()
  const { data: chapter } = await supabase.from('chapters')
    .select('id,book_id,chapter_number,title,unlock_date,poster_url').eq('id', chapterId).single()
  if (!chapter || chapter.book_id !== bookId) notFound()
  const { data: questions } = await supabase.from('questions')
    .select('id,question_text,order_index').eq('chapter_id', chapterId).order('order_index')
  return (
    <div className="max-w-2xl space-y-6 pt-14 md:pt-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/books" className="hover:text-foreground">Books</Link>
        <span>/</span>
        <Link href={'/admin/books/' + bookId} className="hover:text-foreground">Book</Link>
        <span>/</span><span>Edit Chapter {chapter.chapter_number}</span>
      </div>
      <h1 className="text-2xl font-bold">Edit Chapter {chapter.chapter_number}</h1>
      <div className="bg-card border border-border rounded-xl p-6">
        <ChapterForm mode="edit" bookId={bookId} chapter={chapter} initialQuestions={questions ?? []} />
      </div>
    </div>
  )
}