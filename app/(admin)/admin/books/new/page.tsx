import BookForm from '@/components/admin/BookForm'
import Link from 'next/link'
export default function NewBookPage() {
  return (
    <div className="max-w-lg space-y-6 pt-14 md:pt-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/books" className="hover:text-foreground">Books</Link>
        <span>/</span><span>New Book</span>
      </div>
      <h1 className="text-2xl font-bold">New Book</h1>
      <div className="bg-card border border-border rounded-xl p-6"><BookForm mode="create" /></div>
    </div>
  )
}
