import { createClient } from '@/lib/supabase/server'
import { getBookStatus, getTodayUTC } from '@/lib/utils/chapters'
import BooksPageClient from '@/components/youth/BooksPageClient'

export default async function BooksPage() {
  const supabase = await createClient()
  const today = getTodayUTC()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, start_date, end_date')
    .order('start_date', { ascending: true, nullsFirst: false })

  const booksWithStatus = (books ?? []).map(b => ({
    ...b,
    bookStatus: getBookStatus(b.start_date, b.end_date, today),
  }))

  const activeBooks = booksWithStatus.filter(b => b.bookStatus === 'active')
  const upcomingBooks = booksWithStatus.filter(b => b.bookStatus === 'upcoming')
  const completedBooks = booksWithStatus.filter(b => b.bookStatus === 'completed')

  return <BooksPageClient activeBooks={activeBooks} upcomingBooks={upcomingBooks} completedBooks={completedBooks} />
}
