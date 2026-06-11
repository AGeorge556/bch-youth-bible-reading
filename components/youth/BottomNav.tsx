'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { TranslationKey } from '@/lib/i18n/translations'

const navItems: { href: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { href: '/dashboard', labelKey: 'home', icon: Home },
  { href: '/books', labelKey: 'books', icon: BookOpen },
  { href: '/profile', labelKey: 'profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="flex h-16 items-center justify-around max-w-md mx-auto px-4">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 min-w-[60px] py-2 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-full transition-colors',
                active ? 'bg-primary/10 font-semibold' : ''
              )}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                {t(labelKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
