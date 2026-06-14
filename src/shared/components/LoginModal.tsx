'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginCustomer, clearError } from '@/features/auth/store/authSlice'
import { cn } from '@/shared/utils/cn'
import Button from '@/shared/ui/Button'
import { useTranslations } from 'next-intl'

interface LoginModalProps { isOpen: boolean; onClose: () => void; redirectTo?: string }

export default function LoginModal({ isOpen, onClose, redirectTo = '/checkout' }: LoginModalProps) {
  const t = useTranslations('login_modal')
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { loading, error } = useAppSelector(s => s.auth)

  const [activeTab, setActiveTab] = useState<'login' | 'guest'>('login')
  const [showPw,    setShowPw]    = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [form,      setForm]      = useState({ email: '', password: '' })

  useEffect(() => {
    if (isOpen) { setForm({ email: '', password: '' }); setSuccess(false); setActiveTab('login'); dispatch(clearError()) }
  }, [isOpen, dispatch])

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
      setTimeout(() => { onClose(); router.push(redirectTo) }, 800)
    }
  }

  const handleGuestCheckout = () => { onClose(); router.push(redirectTo) }

  const inputCls = "w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors text-ink-1 dark:text-ink-dk1 placeholder:text-ink-2/60"

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-panel shadow-hover animate-scale-in">

          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-btn text-ink-2 dark:text-ink-dk2 hover:bg-border-light dark:hover:bg-border-dark transition-colors">
            <X size={18} />
          </button>

          <div className="px-7 pt-7 pb-5 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-brand-warm/10 rounded-btn flex items-center justify-center">
                <ShoppingBag size={17} className="text-brand-warm" />
              </div>
              <h2 className="font-display text-2xl tracking-heading text-ink-1 dark:text-ink-dk1">{t('title')}</h2>
            </div>
            <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-1 ml-12">{t('subtitle')}</p>
          </div>

          <div className="flex border-b border-border-light dark:border-border-dark">
            {(['login', 'guest'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('flex-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab ? 'text-brand-dark dark:text-brand-light border-b-2 border-brand-dark dark:border-brand-light' : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1')}>
                {tab === 'login' ? t('tab_sign_in') : t('tab_guest')}
              </button>
            ))}
          </div>

          <div className="px-7 py-6">
            {activeTab === 'login' && (
              <div className="animate-fade-in">
                {success && (
                  <div className="flex items-center gap-2 bg-brand-sage/10 border border-brand-sage/20 text-brand-sage text-sm rounded-card px-4 py-3 mb-4">
                    <CheckCircle size={15} /> {t('signed_in')}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm rounded-card px-4 py-3 mb-4">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">{t('label_email')}</label>
                    <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className={inputCls} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{t('label_password')}</label>
                      <button type="button" className="text-xs text-brand-warm hover:underline">{t('forgot')}</button>
                    </div>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className={inputCls + ' pr-10'} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" fullWidth size="lg" loading={loading}>{t('sign_in_checkout')} <ArrowRight size={15} /></Button>
                </form>
                <p className="text-center text-xs text-ink-2 dark:text-ink-dk2 mt-5">
                  {t('no_account')}{' '}
                  <a href="/auth/register" className="text-brand-warm font-medium hover:underline" onClick={onClose}>{t('create_one')}</a>
                </p>
              </div>
            )}

            {activeTab === 'guest' && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-bg-light dark:bg-bg-dark rounded-card p-4 space-y-3">
                  {[
                    { icon: '✓', text: t('guest_pro1') },
                    { icon: '✓', text: t('guest_pro2') },
                    { icon: '✗', text: t('guest_con1') },
                    { icon: '✗', text: t('guest_con2') },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <span className={cn('text-sm font-bold w-4', item.icon === '✓' ? 'text-brand-sage' : 'text-ink-2 dark:text-ink-dk2')}>{item.icon}</span>
                      <span className="text-sm text-ink-1 dark:text-ink-dk1">{item.text}</span>
                    </div>
                  ))}
                </div>
                <Button fullWidth size="lg" onClick={handleGuestCheckout}>{t('continue_as_guest')} <ArrowRight size={15} /></Button>
                <p className="text-center text-xs text-ink-2 dark:text-ink-dk2">
                  {t('save_history')}{' '}
                  <button onClick={() => setActiveTab('login')} className="text-brand-warm font-medium hover:underline">{t('sign_in_instead')}</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
