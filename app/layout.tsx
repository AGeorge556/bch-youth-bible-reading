import type { Metadata, Viewport } from 'next'
import { Alexandria } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

const alexandria = Alexandria({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-alexandria',
})

export const metadata: Metadata = {
  title: 'BCH Youth Bible Reading',
  description: 'Track your Bible reading journey with BCH Youth',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${alexandria.variable} h-full`}>
      <body className="h-full bg-background text-foreground antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
