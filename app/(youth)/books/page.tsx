import { createClient } from '@/lib/supabase/server'
import BooksPageClient from '@/components/youth/BooksPageClient'

export default async function BooksPage() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('id, name, status')
    .order('display_order')

  const activeBooks = books?.filter((b) => b.status === 'active') ?? []
  const archivedBooks = books?.filter((b) => b.status === 'archived') ?? []

  return <BooksPageClient activeBooks={activeBooks} archivedBooks={archivedBooks} />
}
