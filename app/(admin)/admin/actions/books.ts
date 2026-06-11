'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBook(formData: FormData): Promise<{ bookId?: string; error?: string }> {
  const supabase = await createClient()
  const name = (formData.get('name') as string).trim()
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!name) return { error: 'Book name is required' }
  if (start_date && end_date && start_date >= end_date) return { error: 'End date must be after start date' }

  const { data, error } = await supabase
    .from('books').insert({ name, start_date, end_date }).select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/admin/books')
  return { bookId: data.id }
}

export async function updateBook(bookId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const name = (formData.get('name') as string).trim()
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!name) return { error: 'Book name is required' }
  if (start_date && end_date && start_date >= end_date) return { error: 'End date must be after start date' }

  const { error } = await supabase.from('books')
    .update({ name, start_date, end_date, updated_at: new Date().toISOString() }).eq('id', bookId)
  if (error) return { error: error.message }

  // Auto-sync Chapter 1 unlock_date to book start_date
  if (start_date) {
    const { data: ch1 } = await supabase.from('chapters')
      .select('id').eq('book_id', bookId).eq('chapter_number', 1).maybeSingle()
    if (ch1) {
      await supabase.from('chapters')
        .update({ unlock_date: start_date, updated_at: new Date().toISOString() }).eq('id', ch1.id)
    }
  }

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
