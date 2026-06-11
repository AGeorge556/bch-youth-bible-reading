import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/youth/BottomNav'
import LanguageToggle from '@/components/youth/LanguageToggle'

export default async function YouthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <LanguageToggle />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
