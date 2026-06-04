import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isChapterUnlocked } from '@/lib/utils/chapters'
import ChapterClient from '@/components/youth/ChapterClient'
import Link from 'next/link'

export default async function ChapterPage({ params }: { params: Promise<{ bookId: string; chapterId: string }> }) {
  const { bookId, chapterId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: chapter }, { data: profile }] = await Promise.all([
    supabase.from('chapters').select('id,book_id,chapter_number,title,poster_url,unlock_date').eq('id', chapterId).single(),
    supabase.from('profiles').select('role').eq('id', user!.id).single(),
  ])

  if (!chapter || chapter.book_id !== bookId) notFound()
  if (profile?.role !== 'admin' && !isChapterUnlocked(chapter.unlock_date)) notFound()

  const [{ data: book }, { data: questions }, { data: progressRow }, { data: existingAnswers }] = await Promise.all([
    supabase.from('books').select('id,name,status').eq('id', bookId).single(),
    supabase.from('questions').select('id,question_text,order_index').eq('chapter_id', chapterId).order('order_index'),
    supabase.from('reading_progress').select('id').eq('user_id', user!.id).eq('chapter_id', chapterId).maybeSingle(),
    supabase.from('answers').select('question_id,answer_text').eq('user_id', user!.id).eq('chapter_id', chapterId),
  ])

  const isReadInitially = !!progressRow
  const initialAnswers: Record<string, string> = {}
  existingAnswers?.forEach(a => { initialAnswers[a.question_id] = a.answer_text })

  const isArchived = book?.status === 'archived'

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div>
        <Link href={'/books/' + bookId} className="text-sm text-muted-foreground hover:text-foreground">← {book?.name}</Link>
        <h1 className="text-xl font-bold mt-1">
          Chapter {chapter.chapter_number}{chapter.title ? ' — ' + chapter.title : ''}
        </h1>
      </div>
      {isArchived ? (
        <div className="space-y-4">
          {chapter.poster_url && (
            <img src={chapter.poster_url} alt="Chapter poster" className="w-full rounded-xl object-contain border border-border bg-muted max-h-80" />
          )}
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
            This program has ended. Reading and answers are locked.
          </div>
          {Object.keys(initialAnswers).length > 0 && (
            <div className="rounded-xl bg-card border border-border p-5 space-y-4">
              <h2 className="font-semibold">Your Answers</h2>
              {questions?.map((q, i) => (
                <div key={q.id}>
                  <p className="text-sm font-medium">{i + 1}. {q.question_text}</p>
                  <p className="text-sm text-muted-foreground mt-1">{initialAnswers[q.id] ?? '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ChapterClient chapterId={chapterId} posterUrl={chapter.poster_url}
          questions={questions ?? []} initialAnswers={initialAnswers} isReadInitially={isReadInitially} />
      )}
    </div>
  )
}