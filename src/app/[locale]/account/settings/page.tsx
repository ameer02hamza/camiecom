'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, User, Lock, Bell, Check, X, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useAuthGuard } from '@/shared/hooks/useAuthGuard'
import { shopifyFetch, CUSTOMER_UPDATE } from '@/shared/lib/shopify'
import { cn } from '@/shared/utils/cn'
import { useTranslations } from 'next-intl'

type Tab = 'profile' | 'password' | 'preferences'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const dispatch    = useAppDispatch()
  const { customer, accessToken } = useAuthGuard()

  const [tab, setTab]       = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false })
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    if (customer) {
      setProfile({ firstName: customer.firstName ?? '', lastName: customer.lastName ?? '', email: customer.email ?? '', phone: customer.phone ?? '' })
      setMarketing(customer.acceptsMarketing ?? false)
    }
  }, [customer])

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccess(msg); setError(null); setTimeout(() => setSuccess(null), 4000) }
    else { setError(msg); setSuccess(null) }
  }

  const handleSaveProfile = async () => {
    if (!accessToken) return
    setSaving(true)
    try {
      const data = await shopifyFetch<{ customerUpdate: { customerUserErrors: { message: string }[] } }>({
        query: CUSTOMER_UPDATE,
        variables: {
          customerAccessToken: accessToken,
          customer: { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || null, acceptsMarketing: marketing },
        },
        cache: 'no-store',
      })
      const errs = data.customerUpdate.customerUserErrors
      if (errs.length) { showFeedback(errs[0].message, 'error'); return }
      showFeedback(t('profile_saved'), 'success')
    } catch { showFeedback(t('profile_saved'), 'error') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (!accessToken) return
    if (passwords.newPw !== passwords.confirm) { showFeedback(t('passwords_no_match'), 'error'); return }
    if (passwords.newPw.length < 8) { showFeedback(t('password_too_short'), 'error'); return }
    setSaving(true)
    try {
      const data = await shopifyFetch<{ customerUpdate: { customerUserErrors: { message: string }[] } }>({
        query: CUSTOMER_UPDATE,
        variables: { customerAccessToken: accessToken, customer: { password: passwords.newPw } },
        cache: 'no-store',
      })
      const errs = data.customerUpdate.customerUserErrors
      if (errs.length) { showFeedback(errs[0].message, 'error'); return }
      setPasswords({ current: '', newPw: '', confirm: '' })
      showFeedback(t('password_saved'), 'success')
    } catch { showFeedback(t('password_saved'), 'error') }
    finally { setSaving(false) }
  }

  const handleSavePreferences = async () => {
    if (!accessToken) return
    setSaving(true)
    try {
      await shopifyFetch({
        query: CUSTOMER_UPDATE,
        variables: { customerAccessToken: accessToken, customer: { acceptsMarketing: marketing } },
        cache: 'no-store',
      })
      showFeedback(t('preferences_saved'), 'success')
    } catch { showFeedback(t('preferences_saved'), 'error') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors text-ink-1 dark:text-ink-dk1'

  const tabs: { key: Tab; icon: typeof User; label: string }[] = [
    { key: 'profile',     icon: User,  label: t('tab_profile') },
    { key: 'password',    icon: Lock,  label: t('tab_password') },
    { key: 'preferences', icon: Bell,  label: t('tab_preferences') },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mb-8 transition-colors">
        <ArrowLeft size={15} /> {t('back_to_account')}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Settings size={22} className="text-brand-warm" />
        <h1 className="font-display text-3xl tracking-heading">{t('title')}</h1>
      </div>

      <div className="flex gap-1 bg-bg-light dark:bg-bg-dark rounded-card p-1 mb-8">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTab(key); setError(null); setSuccess(null) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-9 rounded-btn text-sm font-medium transition-all',
              tab === key
                ? 'bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 shadow-soft'
                : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1'
            )}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 text-brand-sage text-sm rounded-card px-4 py-3 mb-6">
          <Check size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm rounded-card px-4 py-3 mb-6">
          <X size={15} /> {error}
        </div>
      )}

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-7">

        {tab === 'profile' && (
          <div className="space-y-5">
            <h2 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">{t('profile_section')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{t('label_first_name')}</label>
                <input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{t('label_last_name')}</label>
                <input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{t('label_email')}</label>
              <input value={profile.email} readOnly className={inputCls + ' opacity-60 cursor-not-allowed bg-border-light dark:bg-border-dark'} />
              <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-1">{t('email_note')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{t('label_phone')}</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" className={inputCls} />
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-8 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <><Loader2 size={15} className="animate-spin" /> {t('saving')}</> : t('save_changes')}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="space-y-5">
            <h2 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">{t('password_section')}</h2>
            <p className="text-sm text-ink-2 dark:text-ink-dk2">{t('password_hint')}</p>

            {[
              { key: 'current' as const, label: t('label_current_password'), val: passwords.current, show: showPw.current, onChange: (v: string) => setPasswords(p => ({ ...p, current: v })), onToggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
              { key: 'new' as const,     label: t('label_new_password'),     val: passwords.newPw,  show: showPw.new,     onChange: (v: string) => setPasswords(p => ({ ...p, newPw: v })),   onToggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
              { key: 'confirm' as const, label: t('label_confirm_password'), val: passwords.confirm, show: showPw.confirm, onChange: (v: string) => setPasswords(p => ({ ...p, confirm: v })), onToggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
            ].map(({ key, label, val, show, onChange, onToggle }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{label}</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={val} onChange={e => onChange(e.target.value)} className={inputCls + ' pr-11'} />
                  <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleChangePassword} disabled={saving || !passwords.newPw || !passwords.confirm}
              className="inline-flex items-center gap-2 h-11 px-8 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <><Loader2 size={15} className="animate-spin" /> {t('updating')}</> : t('update_password')}
            </button>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">{t('preferences_section')}</h2>

            <div className="flex items-start justify-between gap-6 py-4 border-b border-border-light dark:border-border-dark">
              <div>
                <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{t('marketing_label')}</p>
                <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('marketing_sub')}</p>
              </div>
              <button onClick={() => setMarketing(!marketing)}
                className={cn('w-11 h-6 rounded-pill transition-colors relative flex-shrink-0 mt-0.5',
                  marketing ? 'bg-brand-sage' : 'bg-border-light dark:bg-border-dark')}>
                <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  marketing ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>

            <div className="flex items-start justify-between gap-6 py-4 border-b border-border-light dark:border-border-dark">
              <div>
                <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{t('notifications_label')}</p>
                <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('notifications_sub')}</p>
              </div>
              <div className="w-11 h-6 rounded-pill bg-brand-sage relative flex-shrink-0 mt-0.5 cursor-not-allowed opacity-60">
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow translate-x-6" />
              </div>
            </div>

            <p className="text-xs text-ink-2 dark:text-ink-dk2">{t('notifications_note')}</p>

            <button onClick={handleSavePreferences} disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-8 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <><Loader2 size={15} className="animate-spin" /> {t('saving')}</> : t('save_preferences')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
