'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { SlidersHorizontal, ChevronDown, X, Loader2 } from 'lucide-react'
import ProductCard from '@/shared/components/ProductCard'
import { ProductGridSkeleton } from '@/shared/ui/Badge'
import { cn } from '@/shared/utils/cn'
import type { SortOption, Product } from '@/shared/types/global.types'
import { shopifyFetch, GET_PRODUCTS, GET_COLLECTIONS } from '@/shared/lib/shopify'
import { mapShopifyProduct, type ShopifyProductNode } from '@/shared/lib/shopifyMapper'
 
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]
 
const SORT_MAP: Record<SortOption, { sortKey: string; reverse: boolean }> = {
  featured:     { sortKey: 'RELEVANCE',  reverse: false },
  newest:       { sortKey: 'CREATED_AT', reverse: true  },
  'price-asc':  { sortKey: 'PRICE',      reverse: false },
  'price-desc': { sortKey: 'PRICE',      reverse: true  },
  'top-rated':  { sortKey: 'RELEVANCE',  reverse: false },
}
 
const PAGE_SIZE = 24
 
interface ShopifyCollectionNode { id: string; handle: string; title: string }
 
export default function ShopPage() {
  const [products, setProducts]         = useState<Product[]>([])
  const [collections, setCollections]   = useState<ShopifyCollectionNode[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [hasNextPage, setHasNextPage]   = useState(false)
  const [endCursor, setEndCursor]       = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy]             = useState<SortOption>('featured')
  const [priceMax, setPriceMax]         = useState(10000)
  const [showFilters, setShowFilters]   = useState(false)
  const [showSaleOnly, setShowSaleOnly] = useState(false)
 
  const fetchProducts = useCallback(async (sort: SortOption, cursor: string | null = null, append = false) => {
    const { sortKey, reverse } = SORT_MAP[sort]
    if (append) setLoadingMore(true)
    else setLoading(true)
 
    try {
      const data = await shopifyFetch<{
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string }
          edges: { node: ShopifyProductNode }[]
        }
      }>({
        query: GET_PRODUCTS,
        variables: { first: PAGE_SIZE, sortKey, reverse, after: cursor ?? undefined },
      })
 
      const newProducts = data.products.edges.map(e => mapShopifyProduct(e.node))
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts)
      setHasNextPage(data.products.pageInfo.hasNextPage)
      setEndCursor(data.products.pageInfo.endCursor)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])
 
  // Reset + fetch on sort change
  useEffect(() => {
    setEndCursor(null)
    fetchProducts(sortBy, null, false)
  }, [sortBy, fetchProducts])
 
  // Fetch collections once
  useEffect(() => {
    shopifyFetch<{ collections: { edges: { node: ShopifyCollectionNode }[] } }>({
      query: GET_COLLECTIONS, variables: { first: 50 },
    })
      .then(d => setCollections(d.collections.edges.map(e => e.node)))
      .catch(console.error)
  }, [])
 
  const maxProductPrice = useMemo(
    () => Math.ceil(Math.max(...products.map(p => p.price), 100) / 100) * 100,
    [products]
  )
 
  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedCategory !== 'All') {
      list = list.filter(p =>
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
      )
    }
    if (showSaleOnly) list = list.filter(p => p.isSale)
    list = list.filter(p => p.price <= priceMax)
    // In-stock products pehle, out-of-stock baad mein
    list.sort((a, b) => {
      if (a.inStock === b.inStock) return 0
      return a.inStock ? -1 : 1
    })
    return list
  }, [products, selectedCategory, showSaleOnly, priceMax])
 
  const activeFilters = [
    selectedCategory !== 'All' && selectedCategory,
    showSaleOnly && 'Sale only',
    priceMax < maxProductPrice && `Under $${priceMax}`,
  ].filter(Boolean) as string[]
 
  const clearAll = () => { setSelectedCategory('All'); setShowSaleOnly(false); setPriceMax(maxProductPrice) }
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-1">Browse</p>
        <h1 className="font-display text-4xl tracking-heading text-ink-1 dark:text-ink-dk1">Shop All</h1>
        <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-1">
          {loading ? 'Loading...' : `${filtered.length} products`}
        </p>
      </div>
 
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map(f => (
            <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-medium rounded-pill">
              {f}
              <button onClick={() => {
                if (f === selectedCategory) setSelectedCategory('All')
                if (f === 'Sale only') setShowSaleOnly(false)
                if (f.startsWith('Under')) setPriceMax(maxProductPrice)
              }}><X size={12} /></button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors underline">Clear all</button>
        </div>
      )}
 
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className={cn('lg:w-60 flex-shrink-0', !showFilters && 'hidden lg:block')}>
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Category</h3>
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory('All')}
                  className={cn('w-full text-left px-3 py-2 rounded-btn text-sm transition-colors',
                    selectedCategory === 'All'
                      ? 'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark font-medium'
                      : 'text-ink-1 dark:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark')}>
                  All
                </button>
                {collections.map(col => (
                  <button key={col.id} onClick={() => setSelectedCategory(col.handle)}
                    className={cn('w-full text-left px-3 py-2 rounded-btn text-sm transition-colors',
                      selectedCategory === col.handle
                        ? 'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark font-medium'
                        : 'text-ink-1 dark:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark')}>
                    {col.title}
                  </button>
                ))}
              </div>
            </div>
 
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
 
            <div>
              <h3 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3">Promotions</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setShowSaleOnly(!showSaleOnly)}
                  className={cn('w-10 h-5 rounded-pill transition-colors relative flex-shrink-0 cursor-pointer',
                    showSaleOnly ? 'bg-brand-sage' : 'bg-border-light dark:bg-border-dark')}>
                  <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    showSaleOnly ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
                <span className="text-sm text-ink-1 dark:text-ink-dk1">Sale items only</span>
              </label>
            </div>
          </div>
        </aside>
 
        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-btn text-sm font-medium hover:bg-border-light dark:hover:bg-border-dark transition-colors">
              <SlidersHorizontal size={15} /> Filters
              {activeFilters.length > 0 && <span className="w-4 h-4 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-[10px] rounded-pill flex items-center justify-center">{activeFilters.length}</span>}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-ink-2 dark:text-ink-dk2 hidden sm:block">Sort:</span>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                  className="appearance-none h-9 pl-3 pr-8 text-sm border border-border-light dark:border-border-dark rounded-btn bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 focus:outline-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-2 dark:text-ink-dk2" />
              </div>
            </div>
          </div>
 
          {loading ? (
            <ProductGridSkeleton count={8} cols={3} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-ink-2 dark:text-ink-dk2 text-lg mb-3">No products match your filters.</p>
              <button onClick={clearAll} className="text-sm text-brand-warm underline">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
 
              {/* Load More */}
              {hasNextPage && selectedCategory === 'All' && !showSaleOnly && priceMax >= maxProductPrice && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => fetchProducts(sortBy, endCursor, true)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 border border-border-light dark:border-border-dark rounded-btn text-sm font-medium hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50">
                    {loadingMore ? <><Loader2 size={15} className="animate-spin" /> Loading...</> : 'Load More Products'}
                  </button>
                </div>
              )}
 
              {/* Total count */}
              <p className="text-center text-xs text-ink-2 dark:text-ink-dk2 mt-6">
                Showing {filtered.length} products {hasNextPage && selectedCategory === 'All' ? '— scroll for more' : ''}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}