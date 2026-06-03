'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/shared/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerCustomer, loginCustomer, clearError } from '@/features/auth/store/authSlice'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { loading, error } = useAppSelector(s => s.auth)

  const [showPw, setShowPw]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [pwError, setPwError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirm: '', phone: '',
    acceptsMarketing: false, terms: false,
  })

  useEffect(() => { return () => { dispatch(clearError()) } }, [dispatch])

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setPwError('Passwords do not match.'); return }
    setPwError('')

    const result = await dispatch(registerCustomer({
      firstName:        form.firstName,
      lastName:         form.lastName,
      email:            form.email,
      password:         form.password,
      phone:            form.phone || undefined,
      acceptsMarketing: form.acceptsMarketing,
    }))

    if (registerCustomer.fulfilled.match(result)) {
      // Auto login after register
      const loginResult = await dispatch(loginCustomer({
        email:    form.email,
        password: form.password,
      }))
      if (loginCustomer.fulfilled.match(loginResult)) {
        setSuccess(true)
        setTimeout(() => router.push('/account'), 1200)
      }
    }
  }

  const cls = "w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-heading mb-2">Create account</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">Join Camiecom and dress with intention</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 text-brand-sage text-sm rounded-card px-4 py-3 mb-4">
            <CheckCircle size={16} /> Account created! Redirecting...
          </div>
        )}

        {(error || pwError) && (
          <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm rounded-card px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error || pwError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {([['firstName','First name'],['lastName','Last name']] as [string,string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{label}</label>
                <input required value={(form as any)[key]} onChange={f(key)}
                  className="w-full h-11 px-3 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors" />
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={f('email')}
              placeholder="your@camiecom.com" className={cls} />
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
              Phone <span className="text-ink-2 dark:text-ink-dk2 font-normal">(optional)</span>
            </label>
            <input type="tel" value={form.phone} onChange={f('phone')}
              placeholder="+1 555 000 0000" className={cls} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required minLength={5}
                value={form.password} onChange={f('password')}
                placeholder="Min. 5 characters" className={cls + ' pr-11'} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Confirm Password</label>
            <input type="password" required value={form.confirm} onChange={f('confirm')}
              placeholder="••••••••" className={cls} />
          </div>

          {/* Marketing checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.acceptsMarketing} onChange={f('acceptsMarketing')}
              className="w-4 h-4 rounded accent-brand-dark" />
            <span className="text-xs text-ink-2 dark:text-ink-dk2">Email me about new arrivals and offers</span>
          </label>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required checked={form.terms} onChange={f('terms')}
              className="w-4 h-4 mt-0.5 rounded accent-brand-dark" />
            <span className="text-xs text-ink-2 dark:text-ink-dk2">
              I agree to the{' '}
              <span className="text-brand-warm hover:underline cursor-pointer">Terms</span>{' '}
              and{' '}
              <span className="text-brand-warm hover:underline cursor-pointer">Privacy Policy</span>
            </span>
          </label>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create Account <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-sm text-ink-2 dark:text-ink-dk2 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-warm font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
