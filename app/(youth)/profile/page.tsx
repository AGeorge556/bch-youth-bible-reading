import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import BadgeCard from '@/components/youth/BadgeCard'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: userBadges }] = await Promise.all([
    supabase.from('profiles').select('full_name,grade,profile_picture_url').eq('id', user!.id).single(),
    supabase.from('user_badges').select('id,awarded_at,badge:badges(name),book:books(name)').eq('user_id', user!.id).order('awarded_at', { ascending: false }),
  ])

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Profile</h1>
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        {profile?.profile_picture_url ? (
          <img src={profile.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <p className="font-semibold">{profile?.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile?.grade}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
      </div>
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
      <div className="pt-2"><LogoutButton /></div>
    </div>
  )
}