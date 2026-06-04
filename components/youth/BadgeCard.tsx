import { BookOpen } from 'lucide-react'

interface Props { bookName: string; badgeName: string; awardedAt: string }

export default function BadgeCard({ bookName, badgeName, awardedAt }: Props) {
  const date = new Date(awardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{bookName}</p>
        <p className="text-xs text-muted-foreground">{badgeName} · {date}</p>
      </div>
    </div>
  )
}