import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isChapterUnlocked, getBookStatus, getTodayUTC } from '@/lib/utils/chapters'
import ChapterPageContent from '@/components/youth/ChapterPageContent'

export default async function ChapterPage({ params }: { params: Promise<{ bookId: string; chapterId: string }> }) {
  const { bookId, chapterId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: chapter }, { data: profile }] = await Promise.all([
    supabase.from('chapters').select('id,book_id,chapter_number,title,poster_url,unlock_date').eq('id', chapterId).single(),
    supabase.from('profiles').select('role').eq('id', user!.id).single(),
  ])

  if (!chapter || chapter.book_id !== bookId) notFound()

  const { data: book } = await supabase.from('books').select('id,name,start_date,end_date').eq('id', bookId).single()
  if (!book) notFound()

  const today = getTodayUTC()
  const bookStatus = getBookStatus(book.start_date, book.end_date, today)
  const isAdmin = profile?.role === 'admin'

  // Block upcoming books for non-admins
  if (!isAdmin && bookStatus === 'upcoming') notFound()
  // Block locked chapters in active books for non-admins
  if (!isAdmin && bookStatus === 'active' && chapter.unlock_date && !isChapterUnlocked(chapter.unlock_date)) notFound()

  const [{ data: questions }, { data: progressRow }, { data: existingAnswers }] = await Promise.all([
    supabase.from('questions').select('id,question_text,order_index').eq('chapter_id', chapterId).order('order_index'),
    supabase.from('reading_progress').select('id').eq('user_id', user!.id).eq('chapter_id', chapterId).maybeSingle(),
    supabase.from('answers').select('question_id,answer_text').eq('user_id', user!.id).eq('chapter_id', chapterId),
  ])

  const initialAnswers: Record<string, string> = {}
  existingAnswers?.forEach(a => { initialAnswers[a.question_id] = a.answer_text })

  return (
    <ChapterPageContent
      bookId={bookId}
      bookName={book.name}
      chapterId={chapterId}
      chapterNumber={chapter.chapter_number}
      chapterTitle={chapter.title}
      posterUrl={chapter.poster_url}
      bookStatus={bookStatus}
      questions={questions ?? []}
      initialAnswers={initialAnswers}
      isReadInitially={!!progressRow}
    />
  )
}
