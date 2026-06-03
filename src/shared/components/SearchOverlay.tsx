'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2, ArrowRight, TrendingUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeSearch } from '@/features/ui/store/uiSlice'
import { shopifyFetch } from '@/shared/lib/shopify'
import { mapShopifyProduct, type ShopifyProductNode } from '@/shared/lib/shopifyMapper'
import { formatPrice } from '@/shared/utils/formatPrice'
import type { Product } from '@/shared/types/global.types'

const SEARCH_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      totalCount
      edges {
        node {
          ... on Product {
            id handle title
            priceRange { minVariantPrice { amount currencyCode } }
            compareAtPriceRange { minVariantPrice { amount currencyCode } }
            featuredImage { url altText width height }
            tags
            variants(first: 1) { edges { node {
              id title availableForSale
              price { amount currencyCode }
              selectedOptions { name value }
            }}}
          }
        }
      }
    }
  }
`

interface SearchData {
  search: { totalCount: number; edges: { node: ShopifyProductNode }[] }
}

const TRENDING = ['Cashmere', 'Linen', 'Silk', 'Knitwear', 'New Arrivals']
const DEBOUNCE_MS = 350

export default function SearchOverlay() {
  const dispatch   = useAppDispatch()
  const isOpen     = useAppSelector(s => s.ui.searchOpen)

  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null)

  // focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) { setResults([]); setTotal(0); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await shopifyFetch<SearchData>({
          query: SEARCH_QUERY,
          variables: { query: trimmed, first: 6 },
          cache: 'no-store',
        })
        setResults(data.search.edges.map(({ node }) => mapShopifyProduct(node)))
        setTotal(data.search.totalCount)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const handleClose = () => dispatch(closeSearch())

  const handleLinkClick = () => {
    handleClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Panel — slides down from top */}
      <div className="relative animate-slide-down">
        <div className="bg-bg-light dark:bg-bg-dark border-b border-border-light dark:border-border-dark shadow-hover">

          {/* Search input row */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            {loading
              ? <Loader2 size={20} className="text-ink-2 dark:text-ink-dk2 animate-spin flex-shrink-0" />
              : <Search size={20} className="text-ink-2 dark:text-ink-dk2 flex-shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, categories, tags…"
              className="flex-1 bg-transparent text-lg text-ink-1 dark:text-ink-dk1 placeholder:text-ink-2 dark:placeholder:text-ink-dk2 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors ml-1 flex-shrink-0"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results / suggestions */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6">

            {/* Empty state — show trending */}
            {!query.trim() && (
              <div>
                <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-3 flex items-center gap-1.5">
                  <TrendingUp size={13} /> Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 text-sm border border-border-light dark:border-border-dark rounded-pill hover:border-brand-dark dark:hover:border-brand-light transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product results */}
            {query.trim() && !loading && results.length > 0 && (
              <div>
                <div className="space-y-1 mb-4">
                  {results.map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={handleLinkClick}
                      className="flex items-center gap-4 p-3 rounded-card hover:bg-surface-light dark:hover:bg-surface-dark transition-colors group"
                    >
                      <div className="relative w-14 h-16 flex-shrink-0 rounded-card overflow-hidden bg-border-light dark:bg-border-dark">
                        {product.images[0]?.url && (
                          <Image
                            src={product.images[0].url}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 truncate group-hover:text-brand-dark dark:group-hover:text-brand-light transition-colors">
                          {product.title}
                        </p>
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{product.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">{formatPrice(product.price)}</p>
                        {product.compareAtPrice && (
                          <p className="text-xs text-ink-2 dark:text-ink-dk2 line-through">{formatPrice(product.compareAtPrice)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View all results link */}
                {total > 6 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border border-border-light dark:border-border-dark rounded-card hover:border-brand-dark dark:hover:border-brand-light transition-colors"
                  >
                    View all {total} results for "{query.trim()}"
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}

            {/* No results */}
            {query.trim() && !loading && results.length === 0 && (
              <p className="text-sm text-ink-2 dark:text-ink-dk2 py-2">
                No results for "{query.trim()}" — try a different term.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
