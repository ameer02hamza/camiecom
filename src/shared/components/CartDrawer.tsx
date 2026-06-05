'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeCart, shopifyUpdateCartLine, shopifyRemoveFromCart } from '@/features/cart/store/cartSlice'
import { formatPrice } from '@/shared/utils/formatPrice'
import Button from '@/shared/ui/Button'
import LoginModal from '@/shared/components/LoginModal'

export default function CartDrawer() {
  const dispatch    = useAppDispatch()
  const router      = useRouter()
  const { items, isOpen, totalAmount, totalQuantity, isLoading } = useAppSelector(s => s.cart)
  const accessToken = useAppSelector(s => s.auth.accessToken)
  const [showLoginModal, setShowLoginModal] = useState(false)

  if (!isOpen) return null

  const shipping   = totalAmount >= 150 ? 0 : 12
  const orderTotal = totalAmount + shipping

  const handleUpdate = (lineId: string, quantity: number) => {
    if (quantity <= 0) dispatch(shopifyRemoveFromCart(lineId))
    else dispatch(shopifyUpdateCartLine({ lineId, quantity }))
  }

  const handleCheckout = () => {
    if (!accessToken) {
      // Not logged in → show login modal (keep drawer open behind it)
      setShowLoginModal(true)
    } else {
      dispatch(closeCart())
      router.push('/checkout')
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => dispatch(closeCart())} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface-light dark:bg-surface-dark animate-slide-left flex flex-col shadow-hover">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold">Your Cart</h2>
            {totalQuantity > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-bold rounded-pill">
                {totalQuantity}
              </span>
            )}
            {isLoading && <Loader2 size={15} className="animate-spin text-ink-2 dark:text-ink-dk2 ml-1" />}
          </div>
          <button onClick={() => dispatch(closeCart())} className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-border-light dark:bg-border-dark rounded-panel flex items-center justify-center mb-4">
                <ShoppingBag size={28} className="text-ink-2 dark:text-ink-dk2" />
              </div>
              <p className="font-medium text-ink-1 dark:text-ink-dk1 mb-1">Your cart is empty</p>
              <p className="text-sm text-ink-2 dark:text-ink-dk2 mb-6">Add something beautiful to get started.</p>
              <Link href="/shop" onClick={() => dispatch(closeCart())}
                className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.variantId} className="flex gap-4 py-4 border-b border-border-light/60 dark:border-border-dark/60 last:border-0">
                  <div className="relative w-20 h-24 flex-shrink-0 rounded-card overflow-hidden bg-border-light dark:bg-border-dark">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/products/${item.handle}`} onClick={() => dispatch(closeCart())}
                        className="font-medium text-sm text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors line-clamp-2">
                        {item.title}
                      </Link>
                      <button onClick={() => dispatch(shopifyRemoveFromCart(item.lineId))} disabled={isLoading}
                        className="p-1 text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors flex-shrink-0 disabled:opacity-40">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-1">{item.variantTitle}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border-light dark:border-border-dark rounded-btn overflow-hidden">
                        <button onClick={() => handleUpdate(item.lineId, item.quantity - 1)} disabled={isLoading}
                          className="w-7 h-7 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-40">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => handleUpdate(item.lineId, item.quantity + 1)} disabled={isLoading}
                          className="w-7 h-7 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-40">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary + Checkout */}
        {items.length > 0 && (
          <div className="border-t border-border-light dark:border-border-dark px-6 py-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Subtotal</span><span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-brand-sage font-medium' : ''}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-brand-sage bg-brand-sage/10 rounded-btn px-3 py-2">
                  Add {formatPrice(150 - totalAmount)} for free shipping
                </p>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border-light dark:border-border-dark">
                <span>Total</span><span>{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={16} />
            </Button>

            <button onClick={() => dispatch(closeCart())} className="w-full text-center text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo="/checkout"
      />
    </div>
  )
}