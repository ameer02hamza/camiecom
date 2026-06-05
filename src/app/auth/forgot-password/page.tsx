'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import AlertBanner from '@/shared/ui/AlertBanner'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-warm/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-brand-warm" />
          </div>
          <h1 className="font-display text-4xl tracking-heading mb-2">Forgot password?</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-sage/10 flex items-center justify-center mx-auto">
              <Mail size={20} className="text-brand-sage" />
            </div>
            <div>
              <p className="font-semibold text-ink-1 dark:text-ink-dk1 mb-1">Check your inbox</p>
              <p className="text-sm text-ink-2 dark:text-ink-dk2">
                If an account exists for <span className="font-medium text-ink-1 dark:text-ink-dk1">{email}</span>, you'll receive a password reset link shortly.
              </p>
            </div>
            <p className="text-xs text-ink-2 dark:text-ink-dk2">
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="text-brand-warm hover:underline"
              >
                try again
              </button>
            </p>
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-brand-warm hover:underline mt-2"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {error && <AlertBanner type="error" message={error} className="mb-4" />}

            <form
              onSubmit={handleSubmit}
              className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 space-y-5"
            >
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@camiecom.com"
              />

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send reset link <ArrowRight size={16} />
              </Button>
            </form>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mt-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
