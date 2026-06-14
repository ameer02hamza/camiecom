'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { shopifyFetch } from '@/shared/lib/shopify'
import { mapShopifyProduct, type ShopifyProductNode } from '@/shared/lib/shopifyMapper'
import ProductCard from '@/shared/components/ProductCard'
import type { Product } from '@/shared/types/global.types'
import { useTranslations } from 'next-intl'

const SEARCH_PRODUCTS = `
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
            variants(first: 10) { edges { node {
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
  search: {
    totalCount: number
    edges: { node: ShopifyProductNode }[]
  }
}

const SUGGESTED_TAGS = ['Cashmere', 'Silk', 'Linen', 'Leather', 'Knitwear']
const DEBOUNCE_MS = 400

export default function SearchPage() {
  const t = useTranslations('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setTotalCount(0)
      setError(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await shopifyFetch<SearchData>({
          query: SEARCH_PRODUCTS,
          variables: { query: trimmed, first: 40 },
          cache: 'no-store',
        })
        const mapped = data.search.edges.map(({ node }) => mapShopifyProduct(node))
        setResults(mapped)
        setTotalCount(data.search.totalCount)
      } catch (err) {
        console.error('Search error:', err)
        setError(t('no_results', { query: trimmed }))
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, t])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl tracking-heading text-center mb-8">{t('title')}</h1>

      {/* Search input */}
      <div className="relative max-w-xl mx-auto mb-12">
        {loading ? (
          <Loader2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2 animate-spin" />
        ) : (
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2" />
        )}
        <input
          type="text"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          className="w-full h-14 pl-12 pr-12 text-base border border-border-light dark:border-border-dark rounded-card bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* States */}
      {query.trim() === '' ? (
        <div className="text-center text-ink-2 dark:text-ink-dk2 py-16">
          <p className="text-lg">{t('start_typing')}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {SUGGESTED_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-2 border border-border-light dark:border-border-dark rounded-pill text-sm hover:border-brand-dark dark:hover:border-brand-light transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-base text-red-500">{error}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-16 text-ink-2 dark:text-ink-dk2">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" />
          <p className="text-sm">{t('searching')}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-ink-2 dark:text-ink-dk2 py-16">
          <p className="text-lg mb-2">{t('no_results', { query })}</p>
          <p className="text-sm">{t('no_results_hint')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-2 dark:text-ink-dk2 mb-6">
            {totalCount} {t('results_for', { query })}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}
