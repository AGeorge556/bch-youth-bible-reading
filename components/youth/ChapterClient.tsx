'use client'
import { useState } from 'react'
import MarkReadButton from './MarkReadButton'
import { saveAnswers } from '@/lib/actions/reading'

interface Props {
  chapterId: string
  posterUrl: string | null
  questions: { id: string; question_text: string; order_index: number }[]
  initialAnswers: Record<string, string>
  isReadInitially: boolean
}

export default function ChapterClient({ chapterId, posterUrl, questions, initialAnswers, isReadInitially }: Props) {
  const [posterOpen, setPosterOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [hasSubmitted, setHasSubmitted] = useState(Object.keys(initialAnswers).length > 0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSubmitAnswers() {
    setSaveError(''); setSaving(true)
    const payload = questions.map(q => ({ questionId: q.id, answerText: answers[q.id] ?? '' }))
    const result = await saveAnswers(chapterId, payload)
    if (result.error) { setSaveError(result.error) } else { setHasSubmitted(true) }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Poster */}
      {posterUrl && (
        <div>
          <img src={posterUrl} alt="Chapter poster" onClick={() => setPosterOpen(true)}
            className="w-full rounded-xl object-contain cursor-pointer border border-border bg-muted max-h-80" />
          <p className="text-xs text-center text-muted-foreground mt-1">Tap to view full screen</p>
        </div>
      )}

      {/* Fullscreen overlay */}
      {posterOpen && posterUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setPosterOpen(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl leading-none">×</button>
          <img src={posterUrl} alt="Full screen poster" className="max-h-screen max-w-screen object-contain" />
        </div>
      )}

      {/* Read confirmation */}
      <div className="rounded-xl bg-card border border-border p-4">
        <MarkReadButton chapterId={chapterId} isReadInitially={isReadInitially} />
      </div>

      {/* Reflection questions */}
      {questions.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <h2 className="font-semibold">Reflection Questions</h2>
          {questions.map((q, i) => (
            <div key={q.id} className="space-y-1">
              <label className="text-sm font-medium">{i + 1}. {q.question_text}</label>
              <textarea value={answers[q.id] ?? ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                rows={3} placeholder="Your answer…"
                className={'w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none ' + (hasSubmitted ? 'bg-muted/50' : 'bg-background')} />
            </div>
          ))}
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <button onClick={handleSubmitAnswers} disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? 'Saving…' : hasSubmitted ? 'Save Changes' : 'Submit Answers'}
          </button>
        </div>
      )}
    </div>
  )
}