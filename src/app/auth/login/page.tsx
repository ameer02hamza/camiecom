'use client'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/shared/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginCustomer, clearError } from '@/features/auth/store/authSlice'

function LoginForm() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const params   = useSearchParams()
  const redirect = params.get('redirect') || '/account'

  const { loading, error, accessToken } = useAppSelector(s => s.auth)

  const [showPw, setShowPw]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm]       = useState({ email: '', password: '', remember: false })

  // Agar pehle se logged in hai toh seedha redirect
  useEffect(() => {
    if (accessToken) router.replace(redirect)
  }, [accessToken, router, redirect])

  useEffect(() => { return () => { dispatch(clearError()) } }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(loginCustomer({ email: form.email, password: form.password }))
    if (loginCustomer.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => router.replace(redirect), 900)
    }
  }

  const cls = 'w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-heading mb-2">Welcome back</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">Sign in to your Camiecom account</p>
          {redirect === '/checkout' && (
            <p className="mt-3 text-xs text-brand-warm bg-brand-warm/10 border border-brand-warm/20 rounded-btn px-3 py-2">
              Sign in to continue to checkout
            </p>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 text-brand-sage text-sm rounded-card px-4 py-3 mb-4">
            <CheckCircle size={16} /> Login successful! Redirecting...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm rounded-card px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="your@camiecom.com" className={cls} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink-1 dark:text-ink-dk1">Password</label>
              <button type="button" className="text-xs text-brand-warm hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••" className={cls + ' pr-11'} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.remember}
              onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
              className="w-4 h-4 rounded accent-brand-dark" />
            <span className="text-sm text-ink-2 dark:text-ink-dk2">Remember me</span>
          </label>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign In <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-sm text-ink-2 dark:text-ink-dk2 mt-6">
          Don't have an account?{' '}
          <Link
            href={`/auth/register${redirect !== '/account' ? `?redirect=${redirect}` : ''}`}
            className="text-brand-warm font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

// useSearchParams needs Suspense boundary
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
