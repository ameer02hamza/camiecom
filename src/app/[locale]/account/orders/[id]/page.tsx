'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Package, CreditCard, Box, Truck,
  CheckCircle2, XCircle, Loader2,
} from 'lucide-react'
import { formatPrice } from '@/shared/utils/formatPrice'
import { shopifyFetch, GET_CUSTOMER_ORDERS } from '@/shared/lib/shopify'
import { useAuthGuard } from '@/shared/hooks/useAuthGuard'

interface LineItem {
  title: string
  quantity: number
  variant: { image: { url: string } | null; price: { amount: string }; title: string } | null
}

interface Order {
  id: string
  orderNumber: number
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  currentTotalPrice: { amount: string; currencyCode: string }
  lineItems: { edges: { node: LineItem }[] }
}

const STATUS_STYLES: Record<string, string> = {
  PAID:        'bg-brand-sage/10 text-brand-sage',
  PENDING:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  FULFILLED:   'bg-brand-warm/10 text-brand-warm',
  CANCELLED:   'bg-brand-red/10 text-brand-red',
  UNFULFILLED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  REFUNDED:    'bg-brand-red/10 text-brand-red',
}

type StepStatus = 'done' | 'active' | 'upcoming'

function getSteps(fin: string, ful: string) {
  const f = fin.toUpperCase(), u = ful.toUpperCase()
  if (f === 'CANCELLED' || f === 'REFUNDED' || u === 'RESTOCKED') {
    return [
      { label: 'Order Placed',         icon: Package,  status: 'done'   as StepStatus },
      { label: 'Cancelled / Refunded', icon: XCircle,  status: 'active' as StepStatus },
    ]
  }
  const steps = [
    { label: 'Order Placed',      icon: Package      },
    { label: 'Payment Confirmed', icon: CreditCard   },
    { label: 'Processing',        icon: Box          },
    { label: 'Dispatched',        icon: Truck        },
    { label: 'Delivered',         icon: CheckCircle2 },
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

function OrderStepper({ financialStatus, fulfillmentStatus }: { financialStatus: string; fulfillmentStatus: string }) {
  const steps = getSteps(financialStatus, fulfillmentStatus)
  const isCancelled = steps.some(s => s.label === 'Cancelled / Refunded')
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const Icon   = step.icon
        const isLast = i === steps.length - 1
        const dot    = step.status === 'done' ? 'bg-brand-warm text-white'
          : step.status === 'active' ? (isCancelled ? 'bg-brand-red text-white' : 'bg-brand-warm text-white')
          : 'bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2'
        const lbl    = step.status === 'done' ? 'text-ink-2 dark:text-ink-dk2'
          : step.status === 'active' ? (isCancelled ? 'text-brand-red font-semibold' : 'text-brand-warm font-semibold')
          : 'text-ink-2/50 dark:text-ink-dk2/40'
        const line   = step.status === 'done' ? 'bg-brand-warm' : 'bg-border-light dark:bg-border-dark'
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
  const { id }          = useParams<{ id: string }>()
  const { accessToken } = useAuthGuard()

  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!accessToken || !id) return
    // URL mein encodeURIComponent se encode tha — decode karo
    const decodedId = decodeURIComponent(id)

    shopifyFetch<{ customer: { orders: { edges: { node: Order }[] } } | null }>({
      query: GET_CUSTOMER_ORDERS,
      variables: { customerAccessToken: accessToken, first: 50, after: null },
      cache: 'no-store',
    })
      .then(data => {
        const all    = data.customer?.orders.edges.map(e => e.node) ?? []
        // Direct match on full Shopify GID
        const target = all.find(o => o.id === decodedId)
        if (target) setOrder(target)
        else setError('Order not found.')
      })
      .catch(() => setError('Could not load order.'))
      .finally(() => setLoading(false))
  }, [accessToken, id])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center gap-3">
      <Loader2 size={22} className="animate-spin text-ink-2 dark:text-ink-dk2" />
      <span className="text-sm text-ink-2 dark:text-ink-dk2">Loading order...</span>
    </div>
  )

  if (error || !order) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-ink-2 dark:text-ink-dk2 mb-4">{error || 'Order not found.'}</p>
      <Link href="/account/orders" className="text-brand-warm hover:underline text-sm">← Back to orders</Link>
    </div>
  )

  const items       = order.lineItems.edges.map(e => e.node)
  const itemCount   = items.reduce((s, i) => s + i.quantity, 0)
  const statusLabel = order.fulfillmentStatus || order.financialStatus
  const statusStyle = STATUS_STYLES[statusLabel] ?? 'bg-gray-100 text-gray-600'
  const subtotal    = items.reduce((s, i) => s + (parseFloat(i.variant?.price.amount ?? '0') * i.quantity), 0)
  const total       = parseFloat(order.currentTotalPrice.amount)
  const shipping    = Math.max(0, total - subtotal)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-heading mb-1">Order #{order.orderNumber}</h1>
          <p className="text-sm text-ink-2 dark:text-ink-dk2">
            {new Date(order.processedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}{itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-pill capitalize ${statusStyle}`}>
          {statusLabel.toLowerCase().replace('_', ' ')}
        </span>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-6 mb-6">
        <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-5">Order Status</p>
        <OrderStepper financialStatus={order.financialStatus} fulfillmentStatus={order.fulfillmentStatus} />
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">Items</h2>
        </div>
        <div className="divide-y divide-border-light/60 dark:divide-border-dark/60">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-btn overflow-hidden bg-border-light dark:bg-border-dark">
                {item.variant?.image?.url
                  ? <Image src={item.variant.image.url} alt={item.title} fill className="object-cover" sizes="64px" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-ink-2 dark:text-ink-dk2" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{item.title}</p>
                {item.variant?.title && item.variant.title !== 'Default Title' && (
                  <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{item.variant.title}</p>
                )}
                <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">Qty {item.quantity}</p>
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
        <h2 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'text-brand-sage' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-3 border-t border-border-light dark:border-border-dark">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}