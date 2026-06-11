'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LoginForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    router.refresh()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">{t('email')}</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@example.com" />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-foreground">{t('password')}</label>
        <input id="password" name="password" type="password" required autoComplete="current-password"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full rounded-2xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity btn-gradient">
        {loading ? t('signing_in') : t('sign_in')}
      </button>
    </form>
  )
}
