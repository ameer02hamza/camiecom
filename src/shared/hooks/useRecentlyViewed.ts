// src/shared/hooks/useRecentlyViewed.ts
// Recently viewed products — localStorage mein persist hota hai
// Max 6 products store hote hain, latest pehle

import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/global.types'

const STORAGE_KEY = 'camie_recently_viewed'
const MAX_ITEMS   = 6

export interface RecentProduct {
  id:       string
  handle:   string
  title:    string
  price:    number
  image:    string
  category: string
}

// localStorage se load karo
function loadRecent(): RecentProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// product save karo (current product exclude karke show karna)
function saveProduct(product: Product) {
  if (typeof window === 'undefined') return
  try {
    const existing = loadRecent()
    // duplicate remove karo
    const filtered = existing.filter(p => p.id !== product.id)
    // naya item pehle add karo, max 6 rakho
    const updated: RecentProduct[] = [
      {
        id:       product.id,
        handle:   product.handle,
        title:    product.title,
        price:    product.price,
        image:    product.images[0]?.url || '',
        category: product.category,
      },
      ...filtered,
    ].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

// Hook — current product save karo, baki show karo
export function useRecentlyViewed(currentProduct: Product | null) {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])

  // Product page pe aao — save karo
  useEffect(() => {
    if (!currentProduct) return
    saveProduct(currentProduct)
    // Current product ko exclude karke show karo
    setRecentProducts(
      loadRecent().filter(p => p.id !== currentProduct.id)
    )
  }, [currentProduct?.id])

  return recentProducts
}