'use client'

import BadgeCard from './BadgeCard'
import LogoutButton from '@/app/(youth)/profile/LogoutButton'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface UserBadge {
  id: string
  awarded_at: string
  badge: unknown
  book: unknown
}

interface Props {
  fullName: string | null
  grade: string | null
  email: string | null
  profilePictureUrl: string | null
  userBadges: UserBadge[]
}

export default function ProfilePageClient({ fullName, grade, email, profilePictureUrl, userBadges }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">{t('profile')}</h1>
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        {profilePictureUrl ? (
          <img src={profilePictureUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
            {fullName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <p className="font-semibold">{fullName}</p>
          <p className="text-sm text-muted-foreground">{grade}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
        </div>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('badges')}</h2>
        {!userBadges.length ? (
          <div className="rounded-xl bg-card border border-border p-5 text-center text-sm text-muted-foreground">{t('complete_book_badge')}</div>
        ) : (
          <div className="space-y-2">
            {userBadges.map(ub => (
              <BadgeCard key={ub.id} bookName={(ub.book as Record<string, string>)?.name ?? '—'} badgeName={(ub.badge as Record<string, string>)?.name ?? 'Badge'} awardedAt={ub.awarded_at} />
            ))}
          </div>
        )}
      </section>
      <div className="pt-2"><LogoutButton /></div>
    </div>
  )
}
