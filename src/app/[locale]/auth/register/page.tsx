'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import AlertBanner from '@/shared/ui/AlertBanner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerCustomer, loginCustomer, clearError } from '@/features/auth/store/authSlice'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const t = useTranslations('register')
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
    if (form.password !== form.confirm) { setPwError(t('passwords_no_match')); return }
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
      const loginResult = await dispatch(loginCustomer({ email: form.email, password: form.password }))
      if (loginCustomer.fulfilled.match(loginResult)) {
        setSuccess(true)
        setTimeout(() => router.push('/account'), 1200)
      }
    }
  }

  const alertMsg = error || pwError

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-heading mb-2">{t('title')}</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">{t('subtitle')}</p>
        </div>

        {success   && <AlertBanner type="success" message={t('success')}  className="mb-4" />}
        {alertMsg  && <AlertBanner type="error"   message={alertMsg}       className="mb-4" />}

        <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('first_name')} required value={form.firstName} onChange={f('firstName')} />
            <Input label={t('last_name')}  required value={form.lastName}  onChange={f('lastName')}  />
          </div>

          <Input label={t('email')}    type="email" required value={form.email} onChange={f('email')} placeholder="your@camiecom.com" />
          <Input label={t('phone')}    type="tel"            value={form.phone} onChange={f('phone')} placeholder="+1 555 000 0000"
            hint={t('phone_hint')} />

          <div className="relative">
            <Input
              label={t('password')}
              type={showPw ? 'text' : 'password'}
              required
              minLength={5}
              value={form.password}
              onChange={f('password')}
              placeholder={t('password_placeholder')}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 bottom-2.5 text-ink-2 dark:text-ink-dk2"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Input
            label={t('confirm_password')}
            type="password"
            required
            value={form.confirm}
            onChange={f('confirm')}
            placeholder="••••••••"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.acceptsMarketing} onChange={f('acceptsMarketing')}
              className="w-4 h-4 rounded accent-brand-dark" />
            <span className="text-xs text-ink-2 dark:text-ink-dk2">{t('marketing_checkbox')}</span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" required checked={form.terms} onChange={f('terms')}
              className="w-4 h-4 mt-0.5 rounded accent-brand-dark" />
            <span className="text-xs text-ink-2 dark:text-ink-dk2">
              {t('terms_checkbox')}{' '}
              <span className="text-brand-warm hover:underline cursor-pointer">{t('terms_link')}</span>{' '}
              {t('terms_and')}{' '}
              <span className="text-brand-warm hover:underline cursor-pointer">{t('privacy_link')}</span>
            </span>
          </label>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {t('submit')} <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-sm text-ink-2 dark:text-ink-dk2 mt-6">
          {t('have_account')}{' '}
          <Link href="/auth/login" className="text-brand-warm font-medium hover:underline">{t('sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}
