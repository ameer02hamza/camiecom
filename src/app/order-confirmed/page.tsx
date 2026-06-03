'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Mail, ArrowRight, ShoppingBag } from 'lucide-react'
import Button from '@/shared/ui/Button'

function OrderConfirmedContent() {
  const params  = useSearchParams()
  const orderId = params.get('order') ?? 'Camie-XXXXX'
  const email   = params.get('email') ?? 'your email'

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="w-20 h-20 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle size={40} className="text-brand-sage" />
        </div>

        <h1 className="font-display text-4xl tracking-heading mb-3 animate-slide-up">Order Confirmed!</h1>
        <p className="text-ink-2 dark:text-ink-dk2 leading-body mb-2 animate-slide-up">
          Thank you for your order. We're getting it ready now.
        </p>
        <p className="text-ink-2 dark:text-ink-dk2 text-sm animate-slide-up">
          A confirmation has been sent to <span className="font-medium text-ink-1 dark:text-ink-dk1">{email}</span>
        </p>

        {/* Order card */}
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-panel shadow-card p-6 mt-8 text-left animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">Order number</p>
              <p className="font-bold text-xl text-ink-1 dark:text-ink-dk1">#{orderId}</p>
            </div>
            <div className="bg-brand-sage/10 text-brand-sage text-xs font-semibold px-3 py-1.5 rounded-pill">
              Processing
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: CheckCircle, label: 'Order placed',         sub: 'Just now',              done: true  },
              { icon: Package,     label: 'Preparing your order', sub: 'Est. 1–2 business days', done: false },
              { icon: ShoppingBag, label: 'Out for delivery',     sub: 'Est. 3–5 business days', done: false },
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
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">Confirmation email</p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">Sent to your inbox with full details</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card p-4 text-left">
            <Package size={16} className="text-brand-warm mb-2" />
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">Track your order</p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">Updates sent via email + SMS</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 animate-slide-up">
          <Link href="/shop">
            <Button size="lg">
              Continue Shopping <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" size="lg">
              View My Orders
            </Button>
          </Link>
        </div>

        <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-8">
          Questions? <Link href="/contact" className="text-brand-warm hover:underline">Contact our team</Link>
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