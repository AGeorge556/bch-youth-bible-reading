import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ count: userCount }, { count: bookCount }, { count: chapterCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'youth'),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('chapters').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Youth Members', value: userCount ?? 0 },
    { label: 'Books', value: bookCount ?? 0 },
    { label: 'Chapters', value: chapterCount ?? 0 },
  ]

  return (
    <div className="max-w-4xl space-y-6 pt-14 md:pt-0">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-5">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="font-semibold mb-2">Quick Links</h2>
        <ul className="space-y-1 text-sm text-primary">
          <li><a href="/admin/books" className="hover:underline">Manage Books &amp; Chapters →</a></li>
          <li><a href="/admin/users" className="hover:underline">View Members →</a></li>
        </ul>
      </div>
    </div>
  )
}
