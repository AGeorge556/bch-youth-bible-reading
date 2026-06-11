'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBook, updateBook, deleteBook } from '@/app/(admin)/admin/actions/books'
import { BIBLE_BOOKS } from '@/lib/bible-books'

interface Props {
  mode: 'create' | 'edit'
  book?: { id: string; name: string; start_date: string | null; end_date: string | null }
}

export default function BookForm({ mode, book }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (mode === 'create') {
      const result = await createBook(formData)
      if (result.error) { setError(result.error); setLoading(false); return }
      router.push('/admin/books/' + result.bookId)
    } else {
      const result = await updateBook(book!.id, formData)
      if (result.error) { setError(result.error); setLoading(false); return }
      router.refresh()
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete "${book!.name}"? This will delete all chapters and reading data. This cannot be undone.`)) return
    setLoading(true)
    const result = await deleteBook(book!.id)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/admin/books')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1">
        <label htmlFor="book-name" className="text-sm font-medium">Book Name</label>
        <select id="book-name" name="name" required defaultValue={book?.name ?? ''}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          {mode === 'create' && (
            <option value="" disabled>Select a book…</option>
          )}
          {BIBLE_BOOKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
          <input id="start-date" name="start_date" type="date" defaultValue={book?.start_date ?? ''}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">Auto-sets Chapter 1 unlock date.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
          <input id="end-date" name="end_date" type="date" defaultValue={book?.end_date ?? ''}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">Extend to reopen a completed book.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? 'Saving…' : mode === 'create' ? 'Create Book' : 'Save Changes'}
        </button>
        {mode === 'edit' && (
          <button type="button" onClick={handleDelete} disabled={loading}
            className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors ml-auto">
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
