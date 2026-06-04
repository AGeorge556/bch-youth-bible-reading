import LoginForm from './LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">BCH Youth</h1>
          <p className="text-muted-foreground mt-1">Bible Reading Program</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
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
