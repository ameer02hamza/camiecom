'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearCart, shopifyUpdateCartLine, shopifyRemoveFromCart } from '@/features/cart/store/cartSlice'
import { formatPrice } from '@/shared/utils/formatPrice'
import Button from '@/shared/ui/Button'

export default function CartPage() {
  const dispatch    = useAppDispatch()
  const router      = useRouter()
  const { items, totalAmount, totalQuantity, isLoading, checkoutUrl } = useAppSelector(s => s.cart)
  const accessToken = useAppSelector(s => s.auth.accessToken)

  const shipping   = totalAmount >= 150 ? 0 : 12
  const tax        = totalAmount * 0.08
  const orderTotal = totalAmount + shipping + tax

  const handleCheckout = () => {
    if (!accessToken) { router.push('/auth/login?redirect=/checkout'); return }
    if (checkoutUrl) {
      dispatch(clearCart())
      window.open(checkoutUrl, '_blank')
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-border-light dark:bg-border-dark rounded-panel flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-ink-2 dark:text-ink-dk2" />
        </div>
        <h1 className="font-display text-3xl tracking-heading mb-2">Your cart is empty</h1>
        <p className="text-ink-2 dark:text-ink-dk2 text-sm mb-8">Add something beautiful to get started.</p>
        <Link href="/shop"><Button size="lg">Continue Shopping <ArrowRight size={16} /></Button></Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl tracking-heading flex items-center gap-3">
          Your Cart ({totalQuantity})
          {isLoading && <Loader2 size={20} className="animate-spin text-ink-2 dark:text-ink-dk2" />}
        </h1>
        <button onClick={() => dispatch(clearCart())} className="text-sm text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors underline">
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-border-light dark:divide-border-dark">
          {items.map(item => (
            <div key={item.variantId} className="flex gap-5 py-6">
              <div className="relative w-24 h-30 flex-shrink-0 rounded-card overflow-hidden bg-border-light dark:bg-border-dark">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                  <Link href={`/products/${item.handle}`} className="font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors line-clamp-2">
                    {item.title}
                  </Link>
                  <button onClick={() => dispatch(shopifyRemoveFromCart(item.lineId))} disabled={isLoading}
                    className="text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors flex-shrink-0 p-1 disabled:opacity-40">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-1">{item.variantTitle}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-border-light dark:border-border-dark rounded-btn overflow-hidden">
                    <button onClick={() => dispatch(shopifyUpdateCartLine({ lineId: item.lineId, quantity: item.quantity - 1 }))} disabled={isLoading}
                      className="w-9 h-9 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-40">
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => dispatch(shopifyUpdateCartLine({ lineId: item.lineId, quantity: item.quantity + 1 }))} disabled={isLoading}
                      className="w-9 h-9 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-40">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-semibold text-ink-1 dark:text-ink-dk1">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-7 sticky top-24">
            <h2 className="font-display text-xl mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Subtotal ({totalQuantity} items)</span><span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-brand-sage font-medium' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Tax (est.)</span><span>{formatPrice(tax)}</span>
              </div>
              {shipping > 0 && (
                <div className="flex items-start gap-2 bg-brand-sage/10 rounded-btn p-3 mt-2">
                  <Truck size={14} className="text-brand-sage mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-brand-sage">Add {formatPrice(150 - totalAmount)} more for free shipping</p>
                </div>
              )}
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-border-light dark:border-border-dark pt-4 mb-6">
              <span>Total</span><span>{formatPrice(orderTotal)}</span>
            </div>

            <div className="flex gap-2 mb-6">
              <input type="text" placeholder="Coupon code" className="flex-1 h-10 px-3 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light" />
              <button className="h-10 px-4 text-sm font-medium border border-border-light dark:border-border-dark rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors">Apply</button>
            </div>

            <Button fullWidth size="lg" onClick={handleCheckout}>
              {accessToken
                ? (checkoutUrl ? 'Checkout on Shopify' : 'Proceed to Checkout')
                : 'Sign in to Checkout'
              } <ArrowRight size={16} />
            </Button>
            <Link href="/shop" className="block text-center text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 transition-colors mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
