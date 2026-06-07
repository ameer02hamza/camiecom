'use client'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag, Check, Loader2 } from 'lucide-react'
import { Product } from '@/shared/types/global.types'
import { Badge, StarRating } from '@/shared/ui/Badge'
import { formatPrice } from '@/shared/utils/formatPrice'
import { cn } from '@/shared/utils/cn'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { shopifyAddToCart, openCart } from '@/features/cart/store/cartSlice'
import { toggleWishlist } from '@/features/wishlist/store/wishlistSlice'
import { addToast } from '@/features/ui/store/uiSlice'

export default function ProductCard({ product }: { product: Product }) {
  const t          = useTranslations('product')
  const dispatch   = useAppDispatch()
  const [adding, setAdding]     = useState(false)
  const [added, setAdded]       = useState(false)
  const wishlistItems = useAppSelector(s => s.wishlist.items)
  const isWishlisted  = wishlistItems.some(i => i.id === product.id)
  const firstVariant  = product.variants[0]
  const isOutOfStock  = !product.inStock
  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!firstVariant || adding || isOutOfStock) return
    setAdding(true)
    const result = await dispatch(shopifyAddToCart({ variantId: firstVariant.id, quantity: 1 }))
    setAdding(false)
    if (shopifyAddToCart.fulfilled.match(result)) {
      dispatch(addToast({ message: `${product.title} added to cart`, type: 'success' }))
      dispatch(openCart())
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } else {
      dispatch(addToast({ message: 'Could not add to cart', type: 'error' }))
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(toggleWishlist({ id: product.id, handle: product.handle, title: product.title, price: product.price, image: product.images[0]?.url || '', category: product.category }))
    dispatch(addToast({ message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', type: isWishlisted ? 'info' : 'success' }))
  }

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="bg-surface-light dark:bg-surface-dark rounded-card overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-border-light dark:bg-border-dark">
          <Image src={product.images[0]?.url || ''} alt={product.title} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock
              ? <Badge label={t('out_of_stock')} variant="sale" />
              : <>
                  {product.isSale && savings > 0 && <Badge label={`-${Math.round((savings / product.compareAtPrice!) * 100)}%`} variant="sale" />}
                  {product.isNew && <Badge label="New" variant="new" />}
                  {product.isBestseller && <Badge label="Bestseller" variant="bestseller" />}
                </>
            }
          </div>

          {/* Wishlist */}
          <button onClick={handleWishlist}
            className={cn('absolute top-3 right-3 w-8 h-8 rounded-pill bg-white/90 dark:bg-black/80 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110',
              isWishlisted && '!opacity-100 text-brand-red')}>
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={handleAddToCart} disabled={adding || isOutOfStock}
              className={cn('w-full h-9 rounded-btn text-sm font-medium flex items-center justify-center gap-2 transition-all',
                isOutOfStock ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' :
                added    ? 'bg-brand-sage text-white' :
                adding   ? 'bg-brand-dark/70 text-white cursor-wait' :
                           'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark hover:opacity-90')}>
              {isOutOfStock ? t('out_of_stock') :
               added   ? <><Check size={14} /> Added!</> :
               adding  ? <><Loader2 size={14} className="animate-spin" /> Adding...</> :
                         <><ShoppingBag size={14} /> Add to Cart</>}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-medium tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-1">{product.category}</p>
          <h3 className="font-medium text-sm text-ink-1 dark:text-ink-dk1 line-clamp-2 mb-2 leading-snug">{product.title}</h3>
          <StarRating rate={product.rating.rate} count={product.rating.count} />
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-base text-ink-1 dark:text-ink-dk1">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-ink-2 dark:text-ink-dk2 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {savings > 0 && <span className="text-xs text-brand-sage font-medium">Save {formatPrice(savings)}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}