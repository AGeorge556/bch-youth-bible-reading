'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import BadgeCard from './BadgeCard'

interface TodayChapter { id: string; chapter_number: number; title: string | null }
interface ActiveBook { id: string; name: string }
interface UserBadge { id: string; awarded_at: string; badge: unknown; book: unknown }
interface Book { id: string; name: string; status: string }

interface Props {
  profileName: string | null
  profilePictureUrl: string | null
  activeBook: ActiveBook | null
  todayChapter: TodayChapter | null
  chaptersRead: number
  userBadges: UserBadge[]
  books: Book[]
}

export default function DashboardClient({
  profileName, profilePictureUrl, activeBook, todayChapter,
  chaptersRead, userBadges, books,
}: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t('welcome_back')} 👋</p>
          <h1 className="text-2xl font-black">{profileName ?? 'Friend'}</h1>
        </div>
        {profilePictureUrl && (
          <img src={profilePictureUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-sm" />
        )}
      </header>

      {activeBook && todayChapter ? (
        <Link href={'/books/' + activeBook.id + '/chapters/' + todayChapter.id}
          className="block rounded-2xl p-5 text-white hover:opacity-95 transition-all hover:scale-[1.01] shadow-lg"
          style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 293), oklch(0.65 0.22 35))' }}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t('todays_reading')}</p>
          <p className="text-lg font-bold mt-1">{activeBook.name}</p>
          <p className="text-sm opacity-80 mt-0.5">
            📖 {t('chapter')} {todayChapter.chapter_number}{todayChapter.title ? ' — ' + todayChapter.title : ''}
          </p>
        </Link>
      ) : (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{t('todays_reading')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('no_reading_scheduled')}</p>
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('progress')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-purple-50 border-l-4 border-purple-500 px-4 py-4">
            <p className="text-2xl font-black text-purple-700">{chaptersRead}</p>
            <p className="text-xs text-purple-500 font-medium mt-0.5">{t('chapters_read')}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 border-l-4 border-amber-400 px-4 py-4">
            <p className="text-2xl font-black text-amber-600">{userBadges.length}</p>
            <p className="text-xs text-amber-500 font-medium mt-0.5">{t('books_finished')}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('badges')}</h2>
        {!userBadges.length ? (
          <div className="rounded-2xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">
            {t('complete_book_badge')}
          </div>
        ) : (
          <div className="space-y-2">
            {userBadges.map(ub => (
              <BadgeCard key={ub.id}
                bookName={(ub.book as Record<string, string>)?.name ?? '—'}
                badgeName={(ub.badge as Record<string, string>)?.name ?? 'Badge'}
                awardedAt={ub.awarded_at} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('books')}</h2>
        {!books.length ? (
          <div className="rounded-2xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">{t('no_books_yet')}</div>
        ) : (
          <div className="space-y-2">
            {books.map(bk => (
              <Link key={bk.id} href={'/books/' + bk.id}
                className={'flex items-center justify-between rounded-2xl border px-4 py-3 hover:scale-[1.01] transition-all ' +
                  (bk.status === 'active'
                    ? 'bg-gradient-to-r from-purple-50 to-transparent border-purple-200'
                    : 'bg-card border-border')}>
                <span className="font-semibold text-sm">{bk.name}</span>
                <span className="flex items-center gap-2">
                  {bk.status === 'active' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{t('active')}</span>}
                  {bk.status === 'archived' && <span className="text-xs text-muted-foreground">{t('past')}</span>}
                  <span className="text-muted-foreground text-sm">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
