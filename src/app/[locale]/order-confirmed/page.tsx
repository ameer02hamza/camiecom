'use client'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, ArrowRight, ShoppingBag } from 'lucide-react'
import Button from '@/shared/ui/Button'
import { useAppDispatch } from '@/store/hooks'
import { clearCart } from '@/features/cart/store/cartSlice'
import { useTranslations } from 'next-intl'

function OrderConfirmedContent() {
  const t = useTranslations('order_confirmed')
  const params  = useSearchParams()
  const orderId = params.get('order') ?? 'Camie-XXXXX'
  const email   = params.get('email') ?? 'your email'
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(clearCart())
  }, [dispatch])

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        <div className="w-20 h-20 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle size={40} className="text-brand-sage" />
        </div>

        <h1 className="font-display text-4xl tracking-heading mb-3 animate-slide-up">{t('title')}</h1>
        <p className="text-ink-2 dark:text-ink-dk2 leading-body mb-2 animate-slide-up">
          {t('subtitle')}
        </p>
        <p className="text-ink-2 dark:text-ink-dk2 text-sm animate-slide-up">
          {t('confirmation_sent')} <span className="font-medium text-ink-1 dark:text-ink-dk1">{email}</span>
        </p>

        {/* Order card */}
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-panel shadow-card p-6 mt-8 text-left animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">{t('order_number_label')}</p>
              <p className="font-bold text-xl text-ink-1 dark:text-ink-dk1">#{orderId}</p>
            </div>
            <div className="bg-brand-sage/10 text-brand-sage text-xs font-semibold px-3 py-1.5 rounded-pill">
              {t('status_processing')}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: CheckCircle, label: t('step_placed'),   sub: t('step_placed_sub'),   done: true  },
              { icon: Package,     label: t('step_preparing'), sub: t('step_preparing_sub'), done: false },
              { icon: ShoppingBag, label: t('step_delivery'),  sub: t('step_delivery_sub'),  done: false },
            ].map(({ icon: Icon, label, sub, done }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-pill flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  done ? 'bg-brand-sage/15 text-brand-sage' : 'bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2'
                }`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${done ? 'text-ink-1 dark:text-ink-dk1' : 'text-ink-2 dark:text-ink-dk2'}`}>{label}</p>
                  <p className="text-xs text-ink-2 dark:text-ink-dk2">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-4 mt-5 animate-slide-up">
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card p-4 text-left">
            <Mail size={16} className="text-brand-warm mb-2" />
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{t('email_card_title')}</p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('email_card_sub')}</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card p-4 text-left">
            <Package size={16} className="text-brand-warm mb-2" />
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{t('track_card_title')}</p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('track_card_sub')}</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 animate-slide-up">
          <Link href="/shop">
            <Button size="lg">
              {t('continue_shopping')} <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" size="lg">
              {t('view_orders')}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-8">
          {t('questions')} <Link href="/contact" className="text-brand-warm hover:underline">{t('contact_team')}</Link>
        </p>
      </div>
    </div>
  )
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center" />}>
      <OrderConfirmedContent />
    </Suspense>
  )
}
