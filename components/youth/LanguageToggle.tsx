'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  function toggle() {
    setLocale(locale === 'en' ? 'ar' : 'en')
  }

  return (
    <button
      onClick={toggle}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      className="fixed top-4 ltr:right-4 rtl:left-4 z-50 flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm hover:bg-muted transition-colors"
    >
      <span>🌐</span>
      <span>{locale === 'en' ? 'AR' : 'EN'}</span>
    </button>
  )
}
