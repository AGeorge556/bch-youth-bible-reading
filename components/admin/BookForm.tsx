'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBook, updateBook, archiveBook, unarchiveBook } from '@/app/(admin)/admin/actions/books'
import { BIBLE_BOOKS } from '@/lib/bible-books'

interface Props {
  mode: 'create' | 'edit'
  book?: { id: string; name: string; display_order: number; status: 'active' | 'archived' }
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

  async function handleArchiveToggle() {
    const isActive = book!.status === 'active'
    const msg = isActive
      ? 'Archive "' + book!.name + '"? Youth will no longer be able to mark new chapters. You can unarchive later.'
      : 'Unarchive "' + book!.name + '"? It will become active again.'
    if (!window.confirm(msg)) return
    setLoading(true)
    const result = isActive ? await archiveBook(book!.id) : await unarchiveBook(book!.id)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.refresh()
    setLoading(false)
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
      {mode === 'edit' && (
        <div className="space-y-1">
          <label htmlFor="display-order" className="text-sm font-medium">Display Order</label>
          <input id="display-order" name="display_order" type="number" defaultValue={book?.display_order}
            className="w-20 rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">Lower = appears first.</p>
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? 'Saving…' : mode === 'create' ? 'Create Book' : 'Save Changes'}
        </button>
        {mode === 'edit' && (
          <button type="button" onClick={handleArchiveToggle} disabled={loading}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors">
            {book!.status === 'active' ? 'Archive' : 'Unarchive'}
          </button>
        )}
      </div>
    </form>
  )
}
