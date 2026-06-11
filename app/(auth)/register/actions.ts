'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const grade = formData.get('grade') as string
  const file = formData.get('avatar') as File | null

  const supabase = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !user) {
    return { error: authError?.message ?? 'Registration failed' }
  }

  let profile_picture_url: string | null = null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const { data: upload, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}.${ext}`, file, { upsert: true })

    if (!uploadError && upload) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(upload.path)
      profile_picture_url = urlData.publicUrl
    }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name,
    grade,
    profile_picture_url,
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(user.id)
    return { error: profileError.message }
  }

  return { success: true }
}
