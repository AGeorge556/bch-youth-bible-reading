import { createClient } from '@/lib/supabase/server'
import ProfilePageClient from '@/components/youth/ProfilePageClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: userBadges }] = await Promise.all([
    supabase.from('profiles').select('full_name,grade,profile_picture_url').eq('id', user!.id).single(),
    supabase.from('user_badges').select('id,awarded_at,badge:badges(name),book:books(name)').eq('user_id', user!.id).order('awarded_at', { ascending: false }),
  ])

  return (
    <ProfilePageClient
      fullName={profile?.full_name ?? null}
      grade={profile?.grade ?? null}
      email={user?.email ?? null}
      profilePictureUrl={profile?.profile_picture_url ?? null}
      userBadges={userBadges ?? []}
    />
  )
}
