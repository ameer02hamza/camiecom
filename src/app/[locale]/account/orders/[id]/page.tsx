'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Package, CreditCard, Box, Truck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/shared/utils/formatPrice'
import { shopifyFetch, GET_CUSTOMER_ORDERS } from '@/shared/lib/shopify'
import { useAuthGuard } from '@/shared/hooks/useAuthGuard'
import { useTranslations } from 'next-intl'

interface LineItem {
  title: string; quantity: number
  variant: { image: { url: string } | null; price: { amount: string }; title: string } | null
}
interface Order {
  id: string; orderNumber: number; processedAt: string
  financialStatus: string; fulfillmentStatus: string
  currentTotalPrice: { amount: string; currencyCode: string }
  lineItems: { edges: { node: LineItem }[] }
}

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-brand-sage/10 text-brand-sage', PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  FULFILLED: 'bg-brand-warm/10 text-brand-warm', CANCELLED: 'bg-brand-red/10 text-brand-red',
  UNFULFILLED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', REFUNDED: 'bg-brand-red/10 text-brand-red',
}

type StepStatus = 'done' | 'active' | 'upcoming'

function getSteps(fin: string, ful: string, t: ReturnType<typeof useTranslations>) {
  const f = fin.toUpperCase(), u = ful.toUpperCase()
  if (f === 'CANCELLED' || f === 'REFUNDED' || u === 'RESTOCKED') {
    return [
      { label: t('step_placed'),    icon: Package, status: 'done'   as StepStatus },
      { label: t('step_cancelled'), icon: XCircle, status: 'active' as StepStatus },
    ]
  }
  const steps = [
    { label: t('step_placed'),     icon: Package      },
    { label: t('step_payment'),    icon: CreditCard   },
    { label: t('step_processing'), icon: Box          },
    { label: t('step_dispatched'), icon: Truck        },
    { label: t('step_delivered'),  icon: CheckCircle2 },
  ]
  let active = 0
  if      (f === 'PENDING')                      active = 0
  else if (f === 'PAID' || f === 'AUTHORIZED') {
    if      (u === 'UNFULFILLED')                active = 2
    else if (u === 'PARTIALLY_FULFILLED' || u === 'IN_TRANSIT') active = 3
    else if (u === 'FULFILLED')                  active = 4
    else                                         active = 1
  } else active = 1
  return steps.map((s, i) => ({ ...s, status: (i < active ? 'done' : i === active ? 'active' : 'upcoming') as StepStatus }))
}

function OrderStepper({ financialStatus, fulfillmentStatus, t }: { financialStatus: string; fulfillmentStatus: string; t: ReturnType<typeof useTranslations> }) {
  const steps = getSteps(financialStatus, fulfillmentStatus, t)
  const isCancelled = steps.some(s => s.label === t('step_cancelled'))
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon; const isLast = i === steps.length - 1
        const dot  = step.status === 'done' ? 'bg-brand-warm text-white'
          : step.status === 'active' ? (isCancelled ? 'bg-brand-red text-white' : 'bg-brand-warm text-white')
          : 'bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2'
        const lbl  = step.status === 'done' ? 'text-ink-2 dark:text-ink-dk2'
          : step.status === 'active' ? (isCancelled ? 'text-brand-red font-semibold' : 'text-brand-warm font-semibold')
          : 'text-ink-2/50 dark:text-ink-dk2/40'
        const line = step.status === 'done' ? 'bg-brand-warm' : 'bg-border-light dark:bg-border-dark'
        return (
          <div key={step.label} className={`flex flex-col items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
            <div className="flex items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dot} ${step.status === 'active' ? 'ring-4 ring-brand-warm/20' : ''}`}>
                <Icon size={14} />
              </div>
              {!isLast && <div className={`h-0.5 flex-1 mx-1 rounded-full ${line}`} />}
            </div>
            <p className={`text-[10px] mt-2 text-center leading-tight w-14 ${lbl}`}>{step.label}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetailPage() {
  const t = useTranslations('order_detail')
  const tOrders = useTranslations('orders')
  const { id }          = useParams<{ id: string }>()
  const { accessToken } = useAuthGuard()
  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!accessToken || !id) return
    const decodedId = decodeURIComponent(id)
    shopifyFetch<{ customer: { orders: { edges: { node: Order }[] } } | null }>({
      query: GET_CUSTOMER_ORDERS,
      variables: { customerAccessToken: accessToken, first: 50, after: null },
      cache: 'no-store',
    })
      .then(data => {
        const all = data.customer?.orders.edges.map(e => e.node) ?? []
        const target = all.find(o => o.id === decodedId)
        if (target) setOrder(target)
        else setError(t('order_not_found'))
      })
      .catch(() => setError(t('could_not_load')))
      .finally(() => setLoading(false))
  }, [accessToken, id, t])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center gap-3">
      <Loader2 size={22} className="animate-spin text-ink-2 dark:text-ink-dk2" />
      <span className="text-sm text-ink-2 dark:text-ink-dk2">{t('loading')}</span>
    </div>
  )

  if (error || !order) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-ink-2 dark:text-ink-dk2 mb-4">{error || t('order_not_found')}</p>
      <Link href="/account/orders" className="text-brand-warm hover:underline text-sm">← {t('back_to_orders')}</Link>
    </div>
  )

  const items       = order.lineItems.edges.map(e => e.node)
  const statusLabel = order.fulfillmentStatus || order.financialStatus
  const statusStyle = STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-600'
  const subtotal    = items.reduce((s, i) => s + (parseFloat(i.variant?.price.amount ?? '0') * i.quantity), 0)
  const total       = parseFloat(order.currentTotalPrice.amount)
  const shipping    = Math.max(0, total - subtotal)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mb-8 transition-colors">
        <ArrowLeft size={15} /> {t('back_to_orders')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-heading mb-1">{t('title', { number: order.orderNumber })}</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">
            {new Date(order.processedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}{t('qty', { count: items.reduce((s, i) => s + i.quantity, 0) })}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-pill capitalize ${statusStyle}`}>
          {statusLabel.toLowerCase().replace('_', ' ')}
        </span>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-6 mb-6">
        <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-5">{t('status_label')}</p>
        <OrderStepper financialStatus={order.financialStatus} fulfillmentStatus={order.fulfillmentStatus} t={tOrders} />
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">{t('items_section')}</h2>
        </div>
        <div className="divide-y divide-border-light/60 dark:divide-border-dark/60">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-btn overflow-hidden bg-border-light dark:bg-border-dark">
                {item.variant?.image?.url
                  ? <Image src={item.variant.image.url} alt={item.title} fill className="object-cover"
                  loading="eager" sizes="64px" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-ink-2 dark:text-ink-dk2" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{item.title}</p>
                {item.variant?.title && item.variant.title !== 'Default Title' && (
                  <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{item.variant.title}</p>
                )}
                <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('qty', { count: item.quantity })}</p>
              </div>
              {item.variant && (
                <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 flex-shrink-0">
                  {formatPrice(parseFloat(item.variant.price.amount) * item.quantity)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-6">
        <h2 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 mb-4">{t('summary_section')}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-2 dark:text-ink-dk2"><span>{t('subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
            <span>{t('shipping')}</span>
            <span className={shipping === 0 ? 'text-brand-sage' : ''}>{shipping === 0 ? t('shipping_free') : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-3 border-t border-border-light dark:border-border-dark">
            <span>{t('total')}</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
