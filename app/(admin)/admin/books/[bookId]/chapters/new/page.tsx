import ChapterForm from '@/components/admin/ChapterForm'
import Link from 'next/link'
export default async function NewChapterPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  return (
    <div className="max-w-2xl space-y-6 pt-14 md:pt-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/books" className="hover:text-foreground">Books</Link>
        <span>/</span>
        <Link href={'/admin/books/' + bookId} className="hover:text-foreground">Book</Link>
        <span>/</span><span>New Chapter</span>
      </div>
      <h1 className="text-2xl font-bold">New Chapter</h1>
      <div className="bg-card border border-border rounded-xl p-6">
        <ChapterForm mode="create" bookId={bookId} />
      </div>
    </div>
  )
}