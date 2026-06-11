'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBook(formData: FormData): Promise<{ bookId?: string; error?: string }> {
  const supabase = await createClient()
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Book name is required' }

  const { data: existing } = await supabase
    .from('books').select('display_order').order('display_order', { ascending: false }).limit(1).maybeSingle()
  const display_order = (existing?.display_order ?? -1) + 1

  const { data, error } = await supabase
    .from('books').insert({ name, display_order }).select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  return { bookId: data.id }
}

export async function updateBook(bookId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const name = (formData.get('name') as string).trim()
  const display_order = parseInt(formData.get('display_order') as string) || 0
  if (!name) return { error: 'Book name is required' }

  const { error } = await supabase.from('books')
    .update({ name, display_order, updated_at: new Date().toISOString() }).eq('id', bookId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  revalidatePath('/admin/books/' + bookId)
  return {}
}

export async function archiveBook(bookId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('books')
    .update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', bookId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  revalidatePath('/admin/books/' + bookId)
  return {}
}

export async function unarchiveBook(bookId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('books')
    .update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', bookId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  revalidatePath('/admin/books/' + bookId)
  return {}
}

export async function deleteBook(bookId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('books').delete().eq('id', bookId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  return {}
}
