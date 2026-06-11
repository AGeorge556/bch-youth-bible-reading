import LoginForm from './LoginForm'
import Link from 'next/link'
import LanguageToggle from '@/components/youth/LanguageToggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <LanguageToggle />
      <div className="w-full max-w-sm">
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 293), oklch(0.65 0.22 35))' }}>
          <div className="text-center px-6 py-6 text-white">
            <p className="text-2xl font-extrabold">Welcome to BCH Bible Reading! 📖</p>
            <p className="text-white/80 mt-1 text-sm">Good to see you again</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-6">Sign in</h2>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
