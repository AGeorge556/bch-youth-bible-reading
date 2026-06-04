'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string
    const full_name = form.get('full_name') as string
    const grade = form.get('grade') as string
    const file = fileRef.current?.files?.[0]

    if (!file) {
      setError('Profile picture is required')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Registration failed')
      setLoading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const { data: upload, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${data.user.id}.${ext}`, file, { upsert: true })

    let profile_picture_url: string | null = null
    if (!uploadError && upload) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(upload.path)
      profile_picture_url = urlData.publicUrl
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name,
      grade,
      profile_picture_url,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
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

      {/* Profile picture */}
      <div className="flex flex-col items-center gap-3">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden hover:bg-accent transition-colors"
        >
          {preview ? (
            <Image src={preview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-2">Tap to add photo</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">Profile picture (required)</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="grade" className="text-sm font-medium">Grade / School Year</label>
        <input
          id="grade"
          name="grade"
          type="text"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. Grade 10 or Year 2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Min. 8 characters"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
