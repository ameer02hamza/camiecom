import type { Product } from '@/shared/types/global.types'

// ─── Raw Shopify node shapes ──────────────────────────────────────────────────

export interface ShopifyProductNode {
  id: string
  handle: string
  title: string
  description?: string
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  featuredImage: { url: string; altText: string; width: number; height: number } | null
  images?: { edges: { node: { url: string; altText: string; width: number; height: number } }[] }
  variants: { edges: { node: ShopifyVariantNode }[] }
  options?: { id: string; name: string; values: string[] }[]
  tags: string[]
  seo?: { title: string; description: string }
}

export interface ShopifyVariantNode {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  compareAtPrice: { amount: string; currencyCode: string } | null
  selectedOptions: { name: string; value: string }[]
  image?: { url: string; altText: string; width: number; height: number }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export function mapShopifyProduct(node: ShopifyProductNode): Product {
  const price     = parseFloat(node.priceRange.minVariantPrice.amount)
  const compareAt = parseFloat(node.compareAtPriceRange.minVariantPrice.amount)

  // images: use images array if available (detail page), fallback to featuredImage
  const images = node.images?.edges.length
    ? node.images.edges.map(e => e.node)
    : node.featuredImage
      ? [node.featuredImage]
      : [{ url: '', altText: node.title, width: 800, height: 1000 }]

  // variants
  const variants = node.variants.edges.map(({ node: v }) => ({
    id:              v.id,
    title:           v.title,
    availableForSale: v.availableForSale,
    price:           parseFloat(v.price?.amount ?? node.priceRange.minVariantPrice.amount),
    compareAtPrice:  v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined,
    selectedOptions: v.selectedOptions ?? [],
    image:           v.image ?? undefined,
  }))

  // tags → derive badges
  const tags       = node.tags ?? []
  const isNew      = tags.some(t => /new|new.arrival/i.test(t))
  const isSale     = compareAt > price && compareAt > 0
  const isBestseller = tags.some(t => /bestseller|best.seller/i.test(t))

  // category = first tag that doesn't match badge keywords, fallback to 'Uncategorized'
  const badgeRe = /new|sale|bestseller|best.seller|summer|basics/i
  const category = tags.find(t => !badgeRe.test(t)) ?? 'Uncategorized'

  return {
    id:               node.id,
    handle:           node.handle,
    title:            node.title,
    description:      node.description ?? '',
    shortDescription: node.description?.slice(0, 120) ?? '',
    price,
    compareAtPrice:   isSale ? compareAt : undefined,
    currency:         node.priceRange.minVariantPrice.currencyCode,
    images,
    variants,
    options:          node.options ?? [],
    category,
    tags,
    rating:           { rate: 4.5, count: 0 },   // Shopify Storefront API has no ratings — placeholder
    inStock:          variants.some(v => v.availableForSale),
    isBestseller,
    isNew,
    isSale,
    collections:      [],
  }
}
