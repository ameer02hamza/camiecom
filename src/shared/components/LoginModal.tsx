'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginCustomer, clearError } from '@/features/auth/store/authSlice'
import { cn } from '@/shared/utils/cn'
import Button from '@/shared/ui/Button'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string   // after login, where to go
}

export default function LoginModal({ isOpen, onClose, redirectTo = '/checkout' }: LoginModalProps) {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { loading, error } = useAppSelector(s => s.auth)

  const [tab, setTab]         = useState<'login' | 'guest'>('login')
  const [showPw, setShowPw]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm]       = useState({ email: '', password: '' })

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setForm({ email: '', password: '' })
      setSuccess(false)
      setTab('login')
      dispatch(clearError())
    }
  }, [isOpen, dispatch])

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(loginCustomer({ email: form.email, password: form.password }))
    if (loginCustomer.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => {
        onClose()
        router.push(redirectTo)
      }, 800)
    }
  }

  const handleGuestCheckout = () => {
    onClose()
    router.push(redirectTo)
  }

  const inputCls = "w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors text-ink-1 dark:text-ink-dk1 placeholder:text-ink-2/60"

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-panel shadow-hover animate-scale-in">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-btn text-ink-2 dark:text-ink-dk2 hover:bg-border-light dark:hover:bg-border-dark transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-brand-warm/10 rounded-btn flex items-center justify-center">
                <ShoppingBag size={17} className="text-brand-warm" />
              </div>
              <h2 className="font-display text-2xl tracking-heading text-ink-1 dark:text-ink-dk1">
                Ready to checkout?
              </h2>
            </div>
            <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-1 ml-12">
              Sign in for a faster experience, or continue as guest.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border-light dark:border-border-dark">
            {(['login', 'guest'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  tab === t
                    ? 'text-brand-dark dark:text-brand-light border-b-2 border-brand-dark dark:border-brand-light'
                    : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1'
                )}
              >
                {t === 'login' ? 'Sign In' : 'Guest Checkout'}
              </button>
            ))}
          </div>

          <div className="px-7 py-6">

            {/* ── LOGIN TAB ── */}
            {tab === 'login' && (
              <div className="animate-fade-in">
                {success && (
                  <div className="flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 text-brand-sage text-sm rounded-card px-4 py-3 mb-4">
                    <CheckCircle size={15} /> Signed in! Redirecting...
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm rounded-card px-4 py-3 mb-4">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-ink-1 dark:text-ink-dk1">Password</label>
                      <button type="button" className="text-xs text-brand-warm hover:underline">
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'} required
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className={inputCls + ' pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2"
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" fullWidth size="lg" loading={loading}>
                    Sign In & Checkout <ArrowRight size={15} />
                  </Button>
                </form>

                <p className="text-center text-xs text-ink-2 dark:text-ink-dk2 mt-5">
                  Don't have an account?{' '}
                  <a
                    href="/auth/register"
                    className="text-brand-warm font-medium hover:underline"
                    onClick={onClose}
                  >
                    Create one
                  </a>
                </p>
              </div>
            )}

            {/* ── GUEST TAB ── */}
            {tab === 'guest' && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-bg-light dark:bg-bg-dark rounded-card p-4 space-y-3">
                  {[
                    { icon: '✓', text: 'No account needed' },
                    { icon: '✓', text: 'Fast & easy checkout' },
                    { icon: '✗', text: 'No order history saved' },
                    { icon: '✗', text: 'No saved addresses' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <span className={cn(
                        'text-sm font-bold w-4',
                        item.icon === '✓' ? 'text-brand-sage' : 'text-ink-2 dark:text-ink-dk2'
                      )}>
                        {item.icon}
                      </span>
                      <span className="text-sm text-ink-1 dark:text-ink-dk1">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button fullWidth size="lg" onClick={handleGuestCheckout}>
                  Continue as Guest <ArrowRight size={15} />
                </Button>

                <p className="text-center text-xs text-ink-2 dark:text-ink-dk2">
                  Want to save your order history?{' '}
                  <button
                    onClick={() => setTab('login')}
                    className="text-brand-warm font-medium hover:underline"
                  >
                    Sign in instead
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
