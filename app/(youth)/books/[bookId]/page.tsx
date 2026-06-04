import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isChapterUnlocked, formatUnlockDate, getTodayUTC } from '@/lib/utils/chapters'
import { Lock, CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'

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
  const isAdmin = profile?.role === 'admin'
  const readIds = new Set(progress?.map(r => r.chapter_id) ?? [])
  const today = getTodayUTC()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div>
        <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">← Books</Link>
        <h1 className="text-xl font-bold mt-1">{book.name}</h1>
        {book.status === 'archived' && (
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
            This program has ended. Chapters are still available to read.
          </div>
        )}
      </div>
      <div className="space-y-2">
        {!chapters?.length && (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">No chapters yet.</div>
        )}
        {chapters?.map(ch => {
          const unlocked = isAdmin || isChapterUnlocked(ch.unlock_date)
          const isRead = readIds.has(ch.id)
          const inner = (
            <div className={'flex items-center justify-between rounded-xl border px-4 py-3 ' + (unlocked ? 'bg-card border-border' : 'bg-muted/30 border-border opacity-60')}>
              <div>
                <p className={'font-medium ' + (!unlocked ? 'text-muted-foreground' : '')}>
                  Chapter {ch.chapter_number}{ch.title ? ' — ' + ch.title : ''}
                </p>
                {!unlocked && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Lock size={11} />Unlocks {formatUnlockDate(ch.unlock_date)}</p>}
              </div>
              {unlocked && (isRead
                ? <CheckCircle size={20} className="text-primary flex-shrink-0" />
                : <Circle size={20} className="text-muted-foreground flex-shrink-0" />)}
            </div>
          )
          return unlocked
            ? <Link key={ch.id} href={'/books/' + bookId + '/chapters/' + ch.id}>{inner}</Link>
            : <div key={ch.id}>{inner}</div>
        })}
      </div>
    </div>
  )
}