import { createClient } from '@/lib/supabase/server'
import { getTodayUTC } from '@/lib/utils/chapters'
import BadgeCard from '@/components/youth/BadgeCard'
import Link from 'next/link'

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

  let todayChapter = null
  if (activeBook) {
    const { data: ch } = await supabase.from('chapters').select('id,chapter_number,title')
      .eq('book_id', activeBook.id).lte('unlock_date', today).order('chapter_number', { ascending: false }).limit(1).maybeSingle()
    todayChapter = ch
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-bold">{profile?.full_name ?? 'Friend'}</h1>
        </div>
        {profile?.profile_picture_url && (
          <img src={profile.profile_picture_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
        )}
      </header>

      {/* Today's Reading */}
      {activeBook && todayChapter ? (
        <Link href={'/books/' + activeBook.id + '/chapters/' + todayChapter.id}
          className="block rounded-xl bg-primary p-5 text-primary-foreground hover:opacity-95 transition-opacity">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">Today&apos;s Reading</p>
          <p className="text-lg font-bold mt-1">{activeBook.name}</p>
          <p className="text-sm opacity-80 mt-0.5">Chapter {todayChapter.chapter_number}{todayChapter.title ? ' — ' + todayChapter.title : ''}</p>
        </Link>
      ) : (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary/70">Today&apos;s Reading</p>
          <p className="text-sm text-muted-foreground mt-1">No reading scheduled yet — check back soon!</p>
        </div>
      )}

      {/* Progress */}
      <section className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-2xl font-bold">{chaptersRead ?? 0}</p><p className="text-xs text-muted-foreground mt-0.5">Chapters read</p></div>
          <div><p className="text-2xl font-bold">{userBadges?.length ?? 0}</p><p className="text-xs text-muted-foreground mt-0.5">Books finished</p></div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Badges</h2>
        {!userBadges?.length ? (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">Complete a book to earn your first badge!</div>
        ) : (
          <div className="space-y-2">
            {userBadges.map(ub => (
              <BadgeCard key={ub.id} bookName={(ub.book as any)?.name ?? '—'} badgeName={(ub.badge as any)?.name ?? 'Badge'} awardedAt={ub.awarded_at} />
            ))}
          </div>
        )}
      </section>

      {/* Books */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Books</h2>
        {!books?.length ? (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">No books yet.</div>
        ) : (
          <div className="space-y-2">
            {books.map(bk => (
              <Link key={bk.id} href={'/books/' + bk.id}
                className={'flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/50 transition-colors ' + (bk.status === 'active' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border')}>
                <span className="font-medium text-sm">{bk.name}</span>
                {bk.status === 'active' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>}
                {bk.status === 'archived' && <span className="text-xs text-muted-foreground">Past</span>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}