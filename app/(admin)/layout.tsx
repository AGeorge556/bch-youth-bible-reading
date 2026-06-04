import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSideNav from '@/components/admin/AdminSideNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSideNav adminName={profile.full_name} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6">{children}</main>
    </div>
  )
}
