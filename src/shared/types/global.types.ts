export interface Product {
  id: string; handle: string; title: string; description: string; shortDescription: string
  price: number; compareAtPrice?: number; currency: string
  images: ProductImage[]; variants: ProductVariant[]; options: ProductOption[]
  category: string; tags: string[]; rating: { rate: number; count: number }
  inStock: boolean; isBestseller?: boolean; isNew?: boolean; isSale?: boolean; collections: string[]
}
export interface ProductImage { url: string; altText: string; width: number; height: number }
export interface ProductVariant {
  id: string; title: string; availableForSale: boolean; price: number; compareAtPrice?: number
  selectedOptions: { name: string; value: string }[]; image?: ProductImage
}
export interface ProductOption { id: string; name: string; values: string[] }
export interface CartItem {
  lineId: string; variantId: string; productId: string; handle: string
  title: string; variantTitle: string; price: number; image: string; quantity: number
}
export interface WishlistItem { id: string; handle: string; title: string; price: number; image: string; category: string }
export interface Customer { id: string; email: string; firstName: string; lastName: string }
export interface Review { id: string; author: string; rating: number; title: string; body: string; date: string; verified: boolean }
export interface Order {
  id: string; orderNumber: string; date: string
  status: 'processing'|'shipped'|'delivered'|'cancelled'
  total: number; currency: string; items: OrderItem[]
}
export interface OrderItem { id: string; title: string; variant: string; quantity: number; price: number; image: string }
export interface Toast { id: string; message: string; type: 'success'|'error'|'info' }
export type Theme = 'light'|'dark'
export type SortOption = 'featured'|'newest'|'price-asc'|'price-desc'|'top-rated'
