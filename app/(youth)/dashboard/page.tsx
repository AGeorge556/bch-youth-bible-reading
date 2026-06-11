import { createClient } from '@/lib/supabase/server'
import { getBookStatus, getTodayUTC } from '@/lib/utils/chapters'
import DashboardClient from '@/components/youth/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayUTC()

  const [
    { data: profile },
    { count: chaptersRead },
    { data: userBadges },
    { data: books },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name,profile_picture_url').eq('id', user!.id).single(),
    supabase.from('reading_progress').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('user_badges').select('id,awarded_at,badge:badges(name),book:books(name)').eq('user_id', user!.id).order('awarded_at', { ascending: false }),
    supabase.from('books').select('id,name,start_date,end_date').order('start_date', { ascending: true, nullsFirst: false }),
  ])

  // Find active book(s) by date range; pick earliest-starting one for Today's Reading
  const activeBooks = (books ?? []).filter(b => getBookStatus(b.start_date, b.end_date, today) === 'active')
  const activeBook = activeBooks.length > 0 ? activeBooks[0] : null

  let todayChapter: { id: string; chapter_number: number; title: string | null } | null = null
  if (activeBook) {
    const { data: ch } = await supabase.from('chapters').select('id,chapter_number,title')
      .eq('book_id', activeBook.id).lte('unlock_date', today).order('chapter_number', { ascending: false }).limit(1).maybeSingle()
    todayChapter = ch ?? null
  }

  // Sort books: active first, upcoming second, completed last; chronological within each group
  const statusOrder = { active: 0, upcoming: 1, completed: 2 } as const
  const booksWithStatus = (books ?? []).map(b => ({
    id: b.id,
    name: b.name,
    bookStatus: getBookStatus(b.start_date, b.end_date, today) as 'active' | 'upcoming' | 'completed',
  })).sort((a, b) => statusOrder[a.bookStatus] - statusOrder[b.bookStatus])

  return (
    <DashboardClient
      profileName={profile?.full_name ?? null}
      profilePictureUrl={profile?.profile_picture_url ?? null}
      activeBook={activeBook ?? null}
      todayChapter={todayChapter}
      chaptersRead={chaptersRead ?? 0}
      userBadges={userBadges ?? []}
      books={booksWithStatus}
    />
  )
}
