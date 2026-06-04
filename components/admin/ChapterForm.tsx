'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createChapter, updateChapter, updateChapterPoster } from '@/app/(admin)/admin/actions/chapters'
type QuestionInput = { id: string; chapter_id?: string; question_text: string; order_index: number; created_at?: string }

type ChapterInput = { id: string; book_id: string; chapter_number: number; title: string | null; poster_url: string | null; unlock_date: string }
type QuestionRow = { id?: string; question_text: string; order_index: number }

interface Props {
  mode: 'create' | 'edit'
  bookId: string
  chapter?: ChapterInput
  initialQuestions?: QuestionInput[]
}

export default function ChapterForm({ mode, bookId, chapter, initialQuestions = [] }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<QuestionRow[]>(
    initialQuestions.map(q => ({ id: q.id, question_text: q.question_text, order_index: q.order_index }))
  )
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(chapter?.poster_url ?? null)

  function addQuestion() {
    setQuestions(prev => [...prev, { question_text: '', order_index: prev.length }])
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => {
      const row = prev[idx]
      if (row.id) setDeletedIds(d => [...d, row.id!])
      return prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_index: i }))
    })
  }

  function updateQuestion(idx: number, text: string) {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, question_text: text } : q))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const chapter_number = parseInt(form.get('chapter_number') as string)
    const title = (form.get('title') as string).trim() || null
    const unlock_date = form.get('unlock_date') as string
    const file = fileRef.current?.files?.[0]

    if (!unlock_date) { setError('Unlock date is required'); setLoading(false); return }

    if (mode === 'create') {
      // Step 1: create chapter without poster
      const result = await createChapter(bookId, { chapter_number, title, unlock_date, poster_url: null, questions })
      if (result.error) { setError(result.error); setLoading(false); return }

      // Step 2: upload poster if provided
      if (file && result.chapterId) {
        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const { data: upload, error: uploadErr } = await supabase.storage
          .from('posters').upload(bookId + '/' + result.chapterId + '.' + ext, file, { upsert: true })
        if (!uploadErr && upload) {
          const { data: { publicUrl } } = supabase.storage.from('posters').getPublicUrl(upload.path)
          await updateChapterPoster(result.chapterId, bookId, publicUrl)
        }
      }
      router.push('/admin/books/' + bookId)
    } else {
      // Edit: upload new poster first if selected, keep existing otherwise
      let poster_url = chapter?.poster_url ?? null
      if (file && chapter?.id) {
        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const { data: upload, error: uploadErr } = await supabase.storage
          .from('posters').upload(bookId + '/' + chapter.id + '.' + ext, file, { upsert: true })
        if (!uploadErr && upload) {
          const { data: { publicUrl } } = supabase.storage.from('posters').getPublicUrl(upload.path)
          poster_url = publicUrl
        }
      }
      const result = await updateChapter(bookId, chapter!.id, {
        chapter_number, title, unlock_date, poster_url, questions, deleted_question_ids: deletedIds,
      })
      if (result.error) { setError(result.error); setLoading(false); return }
      router.push('/admin/books/' + bookId)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Chapter Number</label>
          <input name="chapter_number" type="number" required min={1} defaultValue={chapter?.chapter_number}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Unlock Date</label>
          <input name="unlock_date" type="date" required defaultValue={chapter?.unlock_date}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Title <span className="text-muted-foreground">(optional)</span></label>
        <input name="title" type="text" defaultValue={chapter?.title ?? ''}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. In the Beginning" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Reflection Poster <span className="text-muted-foreground">(JPG/PNG)</span></label>
        {previewUrl && (
          <img src={previewUrl} alt="Current poster" className="w-full max-h-48 object-contain rounded-lg border border-border bg-muted" />
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={e => {
          const f = e.target.files?.[0]
          if (f) setPreviewUrl(URL.createObjectURL(f))
        }} className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium file:px-3 file:py-1.5 hover:file:bg-primary/20" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reflection Questions</label>
          <button type="button" onClick={addQuestion} className="text-sm text-primary hover:underline">+ Add Question</button>
        </div>
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet. Click Add Question to create one.</p>
        )}
        {questions.map((q, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <textarea value={q.question_text} onChange={e => updateQuestion(idx, e.target.value)}
              rows={2} placeholder={'Question ' + (idx + 1)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <button type="button" onClick={() => removeQuestion(idx)} className="mt-1 text-destructive hover:text-destructive/80 text-lg leading-none">×</button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? 'Saving…' : mode === 'create' ? 'Create Chapter' : 'Save Changes'}
        </button>
        <a href={'/admin/books/' + bookId} className="text-sm text-muted-foreground hover:text-foreground">Cancel</a>
      </div>
    </form>
  )
}