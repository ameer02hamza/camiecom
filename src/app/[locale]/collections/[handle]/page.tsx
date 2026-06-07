'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, X, Loader2, SlidersHorizontal } from 'lucide-react'
import { shopifyFetch, GET_COLLECTION_PRODUCTS, GET_COLLECTIONS } from '@/shared/lib/shopify'
import { mapShopifyProduct, type ShopifyProductNode } from '@/shared/lib/shopifyMapper'
import ProductCard from '@/shared/components/ProductCard'
import { ProductGridSkeleton } from '@/shared/ui/Badge'
import { cn } from '@/shared/utils/cn'
import type { SortOption, Product } from '@/shared/types/global.types'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const SORT_KEY_MAP: Record<SortOption, { sortKey: string; reverse: boolean }> = {
  featured:     { sortKey: 'COLLECTION_DEFAULT', reverse: false },
  newest:       { sortKey: 'CREATED',            reverse: true  },
  'price-asc':  { sortKey: 'PRICE',              reverse: false },
  'price-desc': { sortKey: 'PRICE',              reverse: true  },
  'top-rated':  { sortKey: 'COLLECTION_DEFAULT', reverse: false },
}

const PAGE_SIZE = 24

interface CollectionNode { id: string; handle: string; title: string }
interface CollectionResponse {
  collection: {
    id: string; handle: string; title: string; description: string
    image: { url: string; altText: string } | null
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string }
      edges: { node: ShopifyProductNode }[]
    }
  } | null
}

export default function CollectionPage() {
  const { handle } = useParams() as { handle: string }

  const [products, setProducts]       = useState<Product[]>([])
  const [collectionMeta, setMeta]     = useState<{ title: string; description: string; image: string | null } | null>(null)
  const [allCollections, setAllCollections] = useState<CollectionNode[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor]     = useState<string | null>(null)
  const [sortBy, setSortBy]           = useState<SortOption>('featured')
  const [showSaleOnly, setShowSaleOnly] = useState(false)
  const [priceMax, setPriceMax]       = useState(10000)
  const [showFilters, setShowFilters] = useState(false)

  // Variant filters
  const [selectedSizes, setSelectedSizes]   = useState<Set<string>>(new Set())
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set())

  // Derived available options from loaded products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    products.forEach(p => p.options?.find(o => o.name === 'Size')?.values.forEach(v => sizes.add(v)))
    return [...sizes]
  }, [products])

  const availableColors = useMemo(() => {
    const colors = new Set<string>()
    products.forEach(p => p.options?.find(o => o.name === 'Color')?.values.forEach(v => colors.add(v)))
    return [...colors]
  }, [products])

  const fetchProducts = useCallback(async (cursor: string | null = null, append = false) => {
    const { sortKey, reverse } = SORT_KEY_MAP[sortBy]
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const d = await shopifyFetch<CollectionResponse>({
        query: GET_COLLECTION_PRODUCTS,
        variables: { handle, first: PAGE_SIZE, after: cursor, sortKey, reverse },
      })
      if (!d.collection) { setLoading(false); return }
      setMeta({ title: d.collection.title, description: d.collection.description, image: d.collection.image?.url ?? null })
      const newProducts = d.collection.products.edges.map(e => mapShopifyProduct(e.node))
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts)
      setHasNextPage(d.collection.products.pageInfo.hasNextPage)
      setEndCursor(d.collection.products.pageInfo.endCursor)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setLoadingMore(false) }
  }, [handle, sortBy])

  useEffect(() => { setProducts([]); setEndCursor(null); fetchProducts(null, false) }, [handle, sortBy, fetchProducts])

  useEffect(() => {
    shopifyFetch<{ collections: { edges: { node: CollectionNode }[] } }>({
      query: GET_COLLECTIONS, variables: { first: 50 },
    }).then(d => setAllCollections(d.collections.edges.map(e => e.node))).catch(() => {})
  }, [])

  const maxProductPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.price), 100) / 100) * 100,
    [products]
  )

  const filtered = useMemo(() => {
    let list = [...products]
    if (showSaleOnly) list = list.filter(p => p.isSale)
    list = list.filter(p => p.price <= priceMax)
    if (selectedSizes.size > 0) {
      list = list.filter(p =>
        p.variants.some(v =>
          v.selectedOptions.some(o => o.name === 'Size' && selectedSizes.has(o.value))
        )
      )
    }
    if (selectedColors.size > 0) {
      list = list.filter(p =>
        p.variants.some(v =>
          v.selectedOptions.some(o => o.name === 'Color' && selectedColors.has(o.value))
        )
      )
    }
    return list
  }, [products, showSaleOnly, priceMax, selectedSizes, selectedColors])

  const activeFilterCount = [
    showSaleOnly, priceMax < maxProductPrice,
    selectedSizes.size > 0, selectedColors.size > 0
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setShowSaleOnly(false); setPriceMax(maxProductPrice)
    setSelectedSizes(new Set()); setSelectedColors(new Set())
  }

  const toggleSet = (set: Set<string>, val: string) => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    return next
  }

  const title = collectionMeta?.title ?? handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const heroImage = collectionMeta?.image ?? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80'

  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <Image src={heroImage} alt={title} fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-brand-dark/55" />
        <div className="absolute inset-0 flex flex-col justify-end pb-8 max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <nav className="flex items-center gap-2 text-white/60 text-xs mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white">{title}</span>
          </nav>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-heading">{title}</h1>
          {collectionMeta?.description && (
            <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xl">{collectionMeta.description}</p>
          )}
        </div>
      </section>

      {/* Collection tabs */}
      <div className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-4 sm:px-8 py-3 max-w-7xl mx-auto">
          {allCollections.map(c => (
            <Link key={c.id} href={`/collections/${c.handle}`}
              className={cn('flex-shrink-0 px-4 py-2 rounded-pill text-sm font-medium transition-colors whitespace-nowrap',
                handle === c.handle
                  ? 'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark'
                  : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark'
              )}>
              {c.title}
            </Link>
          ))}
          <Link href="/shop" className="flex-shrink-0 px-4 py-2 rounded-pill text-sm font-medium text-ink-2 dark:text-ink-dk2 hover:bg-border-light dark:hover:bg-border-dark transition-colors">
            View All
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className={cn('lg:block w-56 flex-shrink-0', !showFilters && 'hidden lg:block')}>
            <div className="sticky top-24 space-y-7">

              {/* Size filter */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button key={size} onClick={() => setSelectedSizes(toggleSet(selectedSizes, size))}
                        className={cn('px-3 py-1.5 text-xs font-medium border rounded-btn transition-colors',
                          selectedSizes.has(size)
                            ? 'border-brand-dark dark:border-brand-light bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark'
                            : 'border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 hover:border-brand-dark dark:hover:border-brand-light'
                        )}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color filter */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button key={color} onClick={() => setSelectedColors(toggleSet(selectedColors, color))}
                        className={cn('px-3 py-1.5 text-xs font-medium border rounded-btn transition-colors',
                          selectedColors.has(color)
                            ? 'border-brand-dark dark:border-brand-light bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark'
                            : 'border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 hover:border-brand-dark dark:hover:border-brand-light'
                        )}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div>
                <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">
                  Max Price — {priceMax >= maxProductPrice ? 'Any' : `$${priceMax}`}
                </h3>
                <input type="range" min={0} max={maxProductPrice} step={10} value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-brand-dark dark:accent-brand-light" />
                <div className="flex justify-between text-xs text-ink-2 dark:text-ink-dk2 mt-1">
                  <span>$0</span><span>${maxProductPrice}+</span>
                </div>
              </div>

              {/* Sale toggle */}
              <div>
                <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Promotions</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setShowSaleOnly(!showSaleOnly)}
                    className={cn('w-10 h-5 rounded-pill transition-colors relative cursor-pointer flex-shrink-0',
                      showSaleOnly ? 'bg-brand-sage' : 'bg-border-light dark:bg-border-dark')}>
                    <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      showSaleOnly ? 'translate-x-5' : 'translate-x-0.5')} />
                  </div>
                  <span className="text-sm text-ink-1 dark:text-ink-dk1">Sale only</span>
                </label>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-brand-red hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all filters
                </button>
              )}

              {/* All collections */}
              <div>
                <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Collections</h3>
                <div className="space-y-0.5">
                  {allCollections.map(c => (
                    <Link key={c.id} href={`/collections/${c.handle}`}
                      className={cn('block px-2 py-1.5 rounded-btn text-sm transition-colors',
                        handle === c.handle ? 'text-brand-warm font-medium' : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1'
                      )}>
                      {c.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-btn text-sm font-medium hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                  <SlidersHorizontal size={14} /> Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-[10px] rounded-pill flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
                <p className="text-sm text-ink-2 dark:text-ink-dk2">
                  {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                  className="appearance-none h-9 pl-3 pr-8 text-sm border border-border-light dark:border-border-dark rounded-btn bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 focus:outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-2 dark:text-ink-dk2" />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {[...selectedSizes].map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-medium rounded-pill">
                    Size: {s} <button onClick={() => setSelectedSizes(toggleSet(selectedSizes, s))}><X size={11} /></button>
                  </span>
                ))}
                {[...selectedColors].map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-medium rounded-pill">
                    Color: {c} <button onClick={() => setSelectedColors(toggleSet(selectedColors, c))}><X size={11} /></button>
                  </span>
                ))}
                {showSaleOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-medium rounded-pill">
                    Sale <button onClick={() => setShowSaleOnly(false)}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={PAGE_SIZE} cols={3} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 space-y-3">
                <p className="text-ink-2 dark:text-ink-dk2 text-lg">No products match your filters.</p>
                <button onClick={clearAllFilters} className="text-brand-warm text-sm hover:underline">Clear all filters</button>
                <br />
                <Link href="/shop" className="text-brand-warm text-sm hover:underline">Browse all products →</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {hasNextPage && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => fetchProducts(endCursor, true)} disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 border border-border-light dark:border-border-dark rounded-btn text-sm font-medium hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50">
                      {loadingMore ? <><Loader2 size={15} className="animate-spin" /> Loading...</> : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
