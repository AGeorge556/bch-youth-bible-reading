'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { registerUser } from './actions'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function RegisterForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const file = fileRef.current?.files?.[0]

    if (!file) {
      setError(t('profile_picture_required'))
      setLoading(false)
      return
    }

    const formData = new FormData(form)
    formData.set('avatar', file)

    const result = await registerUser(formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Account created but sign-in failed. Please log in manually.')
      router.push('/login')
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden hover:bg-accent transition-colors"
        >
          {preview ? (
            <Image src={preview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-2">{t('tap_to_add_photo')}</span>
          )}
        </div>
        <input ref={fileRef} type="file" name="avatar" accept="image/*" className="hidden" onChange={handleFileChange} />
        <p className="text-xs text-muted-foreground">{t('profile_picture')}</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="full_name" className="text-sm font-medium">{t('full_name')}</label>
        <input id="full_name" name="full_name" type="text" required autoComplete="name"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your full name" />
      </div>

      <div className="space-y-1">
        <label htmlFor="grade" className="text-sm font-medium">{t('grade')}</label>
        <input id="grade" name="grade" type="text" required
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. Grade 10 or Year 2" />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">{t('email')}</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@example.com" />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">{t('password')}</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Min. 8 characters" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-2xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity btn-gradient">
        {loading ? t('creating_account') : t('create_account')}
      </button>
    </form>
  )
}
