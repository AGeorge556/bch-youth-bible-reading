'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteChapter } from '@/app/(admin)/admin/actions/chapters'

export default function ChapterDeleteButton({ bookId, chapterId, chapterNumber }: {
  bookId: string; chapterId: string; chapterNumber: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete Chapter ' + chapterNumber + '? This permanently removes all related answers and reading progress.')) return
    setLoading(true)
    await deleteChapter(bookId, chapterId)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-sm text-destructive hover:underline disabled:opacity-50">
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
