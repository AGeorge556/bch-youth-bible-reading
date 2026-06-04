import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, grade, profile_picture_url')
    .eq('role', 'youth')
    .order('full_name')

  return (
    <div className="max-w-4xl space-y-6 pt-14 md:pt-0">
      <h1 className="text-2xl font-bold">Members ({members?.length ?? 0})</h1>

      <div className="space-y-2">
        {!members?.length && (
          <div className="rounded-xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
            No youth members yet.
          </div>
        )}
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              {member.profile_picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.profile_picture_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {member.full_name[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                <p className="text-xs text-muted-foreground">{member.grade}</p>
              </div>
            </div>
            <Link href={`/admin/users/${member.id}`} className="text-sm text-primary hover:underline">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
