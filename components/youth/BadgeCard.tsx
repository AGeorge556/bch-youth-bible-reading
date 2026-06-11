interface Props { bookName: string; badgeName: string; awardedAt: string }

export default function BadgeCard({ bookName, badgeName, awardedAt }: Props) {
  const date = new Date(awardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <div className="flex items-center gap-4 rounded-2xl p-4"
      style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)', border: '1.5px solid #f59e0b', boxShadow: '0 0 12px rgba(245,158,11,0.25)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
        🏆
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm text-amber-900 truncate">{bookName}</p>
        <p className="text-xs text-amber-700 font-medium">{badgeName}</p>
        <p className="text-xs text-amber-500 mt-0.5">{date}</p>
      </div>
    </div>
  )
}
