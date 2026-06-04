'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Check, ChevronDown, Truck, RotateCcw, Leaf, Loader2 } from 'lucide-react'
import SizeGuideModal from '@/shared/components/SizeGuideModal'
import { shopifyFetch, GET_PRODUCT, GET_PRODUCTS } from '@/shared/lib/shopify'
import { mapShopifyProduct, type ShopifyProductNode } from '@/shared/lib/shopifyMapper'
import { StarRating, Badge } from '@/shared/ui/Badge'
import { formatPrice } from '@/shared/utils/formatPrice'
import { cn } from '@/shared/utils/cn'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { shopifyAddToCart, openCart } from '@/features/cart/store/cartSlice'
import { toggleWishlist } from '@/features/wishlist/store/wishlistSlice'
import { addToast } from '@/features/ui/store/uiSlice'
import ProductCard from '@/shared/components/ProductCard'
import Button from '@/shared/ui/Button'
import ProductImageGallery from '@/shared/components/ProductImageGallery'
import type { Product } from '@/shared/types/global.types'

export default function ProductPage() {
  const { handle } = useParams() as { handle: string }
  const dispatch   = useAppDispatch()
  const wishlistItems = useAppSelector(s => s.wishlist.items)

  const [product, setProduct]       = useState<Product | null>(null)
  const [related, setRelated]       = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)

  const [sizeGuideOpen, setSizeGuideOpen]     = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity]           = useState(1)
  const [added, setAdded]                 = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('Description')

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setSelectedOptions({})

    shopifyFetch<{ product: ShopifyProductNode | null }>({
      query: GET_PRODUCT,
      variables: { handle },
    })
      .then(data => {
        if (!data.product) { setNotFound(true); return }
        setProduct(mapShopifyProduct(data.product))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [handle])

  // fetch related (same category tag) — grab a few products
  useEffect(() => {
    if (!product) return
    shopifyFetch<{ products: { edges: { node: ShopifyProductNode }[] } }>({
      query: GET_PRODUCTS,
      variables: { first: 8, sortKey: 'RELEVANCE', reverse: false },
    })
      .then(data => {
        const all = data.products.edges.map(e => mapShopifyProduct(e.node))
        setRelated(all.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4))
      })
      .catch(() => {})
  }, [product])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-ink-2 dark:text-ink-dk2" />
    </div>
  )

  if (notFound || !product) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="font-display text-4xl mb-4">Product not found</h1>
        <Link href="/shop" className="text-brand-warm underline">Back to shop</Link>
      </div>
    </div>
  )

  const isWishlisted = wishlistItems.some(i => i.id === product.id)
  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : 0

  // derive stock from selected variant, fallback to product-level
  const selectedVariant = product.variants.find(v =>
    product.options.every(opt => v.selectedOptions.some(so => so.name === opt.name && so.value === selectedOptions[opt.name]))
  ) ?? product.variants[0]
  const inStock = selectedVariant?.availableForSale ?? product.inStock

  const handleAddToCart = async () => {
    if (!inStock) return
    const variant = selectedVariant ?? product.variants[0]
    if (!variant) return
    setAdded(false)
    const result = await dispatch(shopifyAddToCart({ variantId: variant.id, quantity }))
    if (shopifyAddToCart.fulfilled.match(result)) {
      dispatch(addToast({ message: 'Added to cart!', type: 'success' }))
      dispatch(openCart())
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } else {
      dispatch(addToast({ message: 'Could not add to cart. Try again.', type: 'error' }))
    }
  }

  const handleWishlist = () => {
    dispatch(toggleWishlist({ id: product.id, handle: product.handle, title: product.title, price: product.price, image: product.images[0]?.url || '', category: product.category }))
    dispatch(addToast({ message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', type: isWishlisted ? 'info' : 'success' }))
  }

  const accordions = [
    { label: 'Description', content: product.description || 'No description available.' },
    { label: 'Materials & Care', content: 'We use only the finest natural fibres. Dry clean or hand wash in cold water. Lay flat to dry. Store folded, not hung.' },
    { label: 'Shipping & Returns', content: 'Free shipping on orders over $150. Free returns within 30 days of delivery. Items must be unworn with original tags attached.' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-ink-2 dark:text-ink-dk2 mb-8">
        <Link href="/" className="hover:text-brand-warm transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-warm transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-ink-1 dark:text-ink-dk1 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        {/* ── IMAGE GALLERY ── */}
        <ProductImageGallery
          images={product.images}
          title={product.title}
          isSale={product.isSale}
          isNew={product.isNew}
          isBestseller={product.isBestseller}
          savingsPercent={savings > 0 ? Math.round((savings / product.compareAtPrice!) * 100) : undefined}
        />

        {/* ── PRODUCT INFO ── */}
        <div>
          <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">{product.category}</p>
          <h1 className="font-display text-4xl lg:text-5xl text-ink-1 dark:text-ink-dk1 tracking-heading leading-tight mb-4">{product.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <StarRating rate={product.rating.rate} count={product.rating.count} size="md" />
            {!inStock && (
              <span className="text-xs font-semibold tracking-label uppercase px-3 py-1 rounded-pill bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-border-light dark:border-border-dark">
            <span className="text-3xl font-bold text-ink-1 dark:text-ink-dk1">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-ink-2 dark:text-ink-dk2 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {savings > 0 && (
              <span className="text-sm font-medium text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded-pill">
                You save {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* Variants */}
          {product.options.map(option => (
            <div key={option.id} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">
                  {option.name}
                  {selectedOptions[option.name] && <span className="font-normal text-ink-2 dark:text-ink-dk2"> — {selectedOptions[option.name]}</span>}
                </p>
                {option.name === 'Size' && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-brand-warm underline hover:opacity-80 transition-opacity"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {option.values.map(value => {
                  const isColor = option.name === 'Color'
                  const colorMap: Record<string, string> = {
                    'Camel': '#c4a882', 'Charcoal': '#4a4a4a', 'Ivory': '#f5f0e8', 'Black': '#1a1a1a',
                    'White': '#fafafa', 'Navy': '#1c2c4c', 'Red': '#c0392b', 'Beige': '#e8d5b7',
                  }
                  return (
                    <button key={value} onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                      className={cn('transition-all',
                        isColor
                          ? cn('w-9 h-9 rounded-pill border-2',
                              selectedOptions[option.name] === value ? 'border-brand-dark dark:border-brand-light scale-110' : 'border-transparent hover:border-border-light dark:hover:border-border-dark')
                          : cn('px-4 py-2 border rounded-btn text-sm font-medium',
                              selectedOptions[option.name] === value
                                ? 'border-brand-dark dark:border-brand-light bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark'
                                : 'border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 hover:border-brand-dark dark:hover:border-brand-light'
                            )
                      )}
                      style={isColor ? { backgroundColor: colorMap[value] || '#ccc' } : {}}>
                      {!isColor && value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-3">Quantity</p>
            <div className={cn("inline-flex items-center border rounded-btn overflow-hidden", inStock ? "border-border-light dark:border-border-dark" : "border-border-light/40 dark:border-border-dark/40 opacity-40 pointer-events-none")}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors text-lg">−</button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors text-lg">+</button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              onClick={handleAddToCart}
              fullWidth
              disabled={!inStock}
              className={!inStock ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {!inStock
                ? 'Out of Stock'
                : added
                  ? <><Check size={18} /> Added to Cart!</>
                  : <><ShoppingBag size={18} /> Add to Cart</>
              }
            </Button>
            <button onClick={handleWishlist}
              className={cn('w-12 h-12 flex-shrink-0 border rounded-btn flex items-center justify-center transition-colors',
                isWishlisted ? 'border-brand-red bg-brand-red/5 text-brand-red' : 'border-border-light dark:border-border-dark hover:border-brand-red hover:text-brand-red')}>
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-3 mb-8 pb-8 border-b border-border-light dark:border-border-dark">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders $150+' },
              { icon: RotateCcw, label: 'Free Returns', sub: '30-day policy' },
              { icon: Leaf, label: 'Sustainable', sub: 'Ethical made' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5 py-3 bg-bg-light dark:bg-bg-dark rounded-card">
                <Icon size={16} className="text-brand-sage" />
                <p className="text-xs font-medium text-ink-1 dark:text-ink-dk1">{label}</p>
                <p className="text-[11px] text-ink-2 dark:text-ink-dk2">{sub}</p>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className="space-y-0 divide-y divide-border-light dark:divide-border-dark border-t border-border-light dark:border-border-dark">
            {accordions.map(({ label, content }) => (
              <div key={label}>
                <button onClick={() => setOpenAccordion(openAccordion === label ? null : label)}
                  className="w-full flex items-center justify-between py-4 text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors">
                  {label}
                  <ChevronDown size={16} className={cn('transition-transform', openAccordion === label && 'rotate-180')} />
                </button>
                {openAccordion === label && (
                  <p className="pb-5 text-sm text-ink-2 dark:text-ink-dk2 leading-body">{content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section className="mt-20 pt-16 border-t border-border-light dark:border-border-dark">
          <h2 className="font-display text-3xl tracking-heading text-ink-1 dark:text-ink-dk1 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  )
}