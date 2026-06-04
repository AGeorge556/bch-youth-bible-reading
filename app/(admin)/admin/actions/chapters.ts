'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface QuestionInput {
  id?: string
  question_text: string
  order_index: number
}

interface ChapterData {
  chapter_number: number
  title: string | null
  unlock_date: string
  poster_url: string | null
  questions: QuestionInput[]
  deleted_question_ids?: string[]
}

export async function createChapter(
  bookId: string,
  data: ChapterData
): Promise<{ chapterId?: string; error?: string }> {
  const supabase = await createClient()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .insert({ book_id: bookId, chapter_number: data.chapter_number, title: data.title || null, unlock_date: data.unlock_date, poster_url: data.poster_url })
    .select('id').single()
  if (error) return { error: error.message }

  const validQ = data.questions.filter(q => q.question_text.trim())
  if (validQ.length > 0) {
    await supabase.from('questions').insert(
      validQ.map(q => ({ chapter_id: chapter.id, question_text: q.question_text.trim(), order_index: q.order_index }))
    )
  }

  revalidatePath('/admin/books/' + bookId)
  return { chapterId: chapter.id }
}

export async function updateChapter(
  bookId: string,
  chapterId: string,
  data: ChapterData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('chapters').update({
    chapter_number: data.chapter_number, title: data.title || null,
    unlock_date: data.unlock_date, poster_url: data.poster_url,
    updated_at: new Date().toISOString(),
  }).eq('id', chapterId)
  if (error) return { error: error.message }

  if (data.deleted_question_ids?.length) {
    await supabase.from('questions').delete().in('id', data.deleted_question_ids)
  }

  for (const q of data.questions.filter(q => q.question_text.trim())) {
    if (q.id) {
      await supabase.from('questions')
        .update({ question_text: q.question_text.trim(), order_index: q.order_index }).eq('id', q.id)
    } else {
      await supabase.from('questions').insert({
        chapter_id: chapterId, question_text: q.question_text.trim(), order_index: q.order_index,
      })
    }
  }

  revalidatePath('/admin/books/' + bookId)
  return {}
}

export async function updateChapterPoster(
  chapterId: string, bookId: string, posterUrl: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('chapters')
    .update({ poster_url: posterUrl, updated_at: new Date().toISOString() }).eq('id', chapterId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books/' + bookId)
  return {}
}

export async function deleteChapter(bookId: string, chapterId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId)
  if (error) return { error: error.message }
  revalidatePath('/admin/books/' + bookId)
  return {}
}
