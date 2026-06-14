'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { removeFromWishlist } from '@/features/wishlist/store/wishlistSlice'
import { shopifyAddToCart, openCart } from '@/features/cart/store/cartSlice'
import { addToast } from '@/features/ui/store/uiSlice'
import { formatPrice } from '@/shared/utils/formatPrice'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { useTranslations } from 'next-intl'

export default function WishlistPage() {
  const t = useTranslations('wishlist_page')
  const dispatch = useAppDispatch()
  const items    = useAppSelector(s => s.wishlist.items)
  const [addingId, setAddingId] = useState<string | null>(null)

  const handleMoveToCart = async (item: typeof items[0]) => {
    setAddingId(item.id)
    const result = await dispatch(shopifyAddToCart({ variantId: item.id, quantity: 1 }))
    setAddingId(null)
    if (shopifyAddToCart.fulfilled.match(result)) {
      dispatch(removeFromWishlist(item.id))
      dispatch(openCart())
      dispatch(addToast({ message: t('moved_to_cart', { title: item.title }), type: 'success' }))
    } else {
      dispatch(addToast({ message: t('cart_error'), type: 'error' }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mb-8 transition-colors">
        <ArrowLeft size={15} /> {t('back_to_account')}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Heart size={22} className="text-brand-red" />
        <h1 className="font-display text-3xl tracking-heading">{t('title')}</h1>
        {items.length > 0 && (
          <span className="text-sm text-ink-2 dark:text-ink-dk2 ml-1">{t('items_count', { count: items.length })}</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-border-light dark:bg-border-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-ink-2 dark:text-ink-dk2 opacity-40" />
          </div>
          <p className="text-lg text-ink-2 dark:text-ink-dk2 mb-2">{t('empty_title')}</p>
          <p className="text-sm text-ink-2 dark:text-ink-dk2 mb-6">{t('empty_sub')}</p>
          <Link href="/shop" className="inline-flex items-center gap-2 h-10 px-6 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-medium hover:opacity-90 transition-opacity">
            {t('browse_shop')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="group bg-surface-light dark:bg-surface-dark rounded-card shadow-soft overflow-hidden hover:shadow-card transition-all hover:-translate-y-0.5">
              <Link href={`/products/${item.handle}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-border-light dark:bg-border-dark">
                  <Image 
                  loading="eager" src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 50vw,25vw" />
                </div>
              </Link>

              <div className="p-3">
                <p className="text-[11px] font-medium tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-1">{item.category}</p>
                <Link href={`/products/${item.handle}`}>
                  <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 line-clamp-2 hover:text-brand-warm transition-colors mb-2">{item.title}</p>
                </Link>
                <p className="font-semibold text-sm text-ink-1 dark:text-ink-dk1 mb-3">{formatPrice(item.price)}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={addingId === item.id}
                    className={cn(
                      'flex-1 h-8 rounded-btn text-xs font-medium flex items-center justify-center gap-1.5 transition-all',
                      'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark hover:opacity-90 disabled:opacity-50'
                    )}>
                    {addingId === item.id
                      ? <><Loader2 size={12} className="animate-spin" /> {t('adding')}</>
                      : <><ShoppingBag size={12} /> {t('add_to_cart')}</>
                    }
                  </button>
                  <button
                    onClick={() => {
                      dispatch(removeFromWishlist(item.id))
                      dispatch(addToast({ message: t('removed'), type: 'info' }))
                    }}
                    className="w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark rounded-btn hover:border-brand-red hover:text-brand-red transition-colors text-ink-2 dark:text-ink-dk2">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
