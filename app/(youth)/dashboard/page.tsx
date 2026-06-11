import { createClient } from '@/lib/supabase/server'
import { getTodayUTC } from '@/lib/utils/chapters'
import DashboardClient from '@/components/youth/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = getTodayUTC()

  const [
    { data: profile },
    { data: activeBook },
    { count: chaptersRead },
    { data: userBadges },
    { data: books },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name,profile_picture_url').eq('id', user!.id).single(),
    supabase.from('books').select('id,name').eq('status', 'active').order('display_order').limit(1).maybeSingle(),
    supabase.from('reading_progress').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('user_badges').select('id,awarded_at,badge:badges(name),book:books(name)').eq('user_id', user!.id).order('awarded_at', { ascending: false }),
    supabase.from('books').select('id,name,status').order('display_order'),
  ])

  let todayChapter: { id: string; chapter_number: number; title: string | null } | null = null
  if (activeBook) {
    const { data: ch } = await supabase.from('chapters').select('id,chapter_number,title')
      .eq('book_id', activeBook.id).lte('unlock_date', today).order('chapter_number', { ascending: false }).limit(1).maybeSingle()
    todayChapter = ch ?? null
  }

  return (
    <DashboardClient
      profileName={profile?.full_name ?? null}
      profilePictureUrl={profile?.profile_picture_url ?? null}
      activeBook={activeBook ?? null}
      todayChapter={todayChapter}
      chaptersRead={chaptersRead ?? 0}
      userBadges={userBadges ?? []}
      books={books ?? []}
    />
  )
}
