'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type MarkChapterReadResult =
  | { success: false; error: string }
  | { success: true; badgeAwarded: false }
  | { success: true; badgeAwarded: true; bookName: string }

export async function markChapterRead(chapterId: string): Promise<MarkChapterReadResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error: insertError } = await supabase.from('reading_progress')
    .upsert({ user_id: user.id, chapter_id: chapterId }, { onConflict: 'user_id,chapter_id', ignoreDuplicates: true })
  if (insertError) return { success: false, error: insertError.message }

  const { data: chapter } = await supabase.from('chapters').select('book_id').eq('id', chapterId).single()
  if (!chapter) { revalidatePath('/', 'layout'); return { success: true, badgeAwarded: false } }

  const bookId = chapter.book_id
  const { data: bookChapters } = await supabase.from('chapters').select('id').eq('book_id', bookId)
  const chapterIds = bookChapters?.map(c => c.id) ?? []
  const totalCount = chapterIds.length
  const { count: userCount } = totalCount > 0
    ? await supabase.from('reading_progress').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).in('chapter_id', chapterIds)
    : { count: 0 }

  if (!userCount || !totalCount || userCount < totalCount) {
    revalidatePath('/', 'layout'); return { success: true, badgeAwarded: false }
  }

  const { data: badge } = await supabase.from('badges').select('id').eq('badge_type', 'finished_book').single()
  if (!badge) { revalidatePath('/', 'layout'); return { success: true, badgeAwarded: false } }

  await supabase.from('user_badges')
    .upsert({ user_id: user.id, badge_id: badge.id, book_id: bookId }, { onConflict: 'user_id,badge_id,book_id', ignoreDuplicates: true })

  const { data: book } = await supabase.from('books').select('name').eq('id', bookId).single()
  revalidatePath('/', 'layout')
  return { success: true, badgeAwarded: true, bookName: book?.name ?? 'this book' }
}

export async function saveAnswers(chapterId: string, answers: { questionId: string; answerText: string }[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const rows = answers.filter(a => a.answerText.trim()).map(a => ({
    user_id: user.id, question_id: a.questionId, chapter_id: chapterId, answer_text: a.answerText.trim(),
  }))
  if (!rows.length) return {}
  const { error } = await supabase.from('answers').upsert(rows, { onConflict: 'user_id,question_id' })
  return error ? { error: error.message } : {}
}