# Camiecom — Premium Fashion Ecommerce

> "Dress with intention" — A production-ready Next.js ecommerce frontend, Shopify-ready.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home (Hero, Categories, Bestsellers, Promo, New Arrivals)
│   ├── shop/page.tsx       # Shop All (Filter sidebar, Sort, Grid)
│   ├── products/[handle]/  # Product Detail (Gallery, Variants, Reviews, Related)
│   ├── cart/page.tsx       # Cart (Items, Coupon, Summary, Checkout)
│   ├── search/page.tsx     # Search results
│   ├── auth/login/         # Login form
│   ├── auth/register/      # Register form
│   ├── account/page.tsx    # Account dashboard
│   ├── account/orders/     # Order history
│   ├── about/page.tsx      # Brand story
│   ├── contact/page.tsx    # Contact form
│   └── not-found.tsx       # 404 page
│
├── features/
│   ├── cart/store/         # cartSlice (addItem, removeItem, updateQty, clear)
│   ├── wishlist/store/     # wishlistSlice (toggleWishlist)
│   └── ui/store/           # uiSlice (theme, menus, toasts)
│
├── shared/
│   ├── components/         # Navbar, Footer, CartDrawer, MobileMenu, ToastContainer, ProductCard
│   ├── ui/                 # Button, Badge, StarRating, Skeleton
│   ├── lib/shopify.ts      # GraphQL client + all 10 Shopify queries/mutations
│   └── utils/              # cn(), formatPrice()
│
├── store/                  # Redux configureStore, typed hooks
├── providers/              # ReduxProvider
└── data/mockData.ts        # 12 products, reviews, orders, banners
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#fafaf8` |
| Primary Dark | `#2d2926` |
| Accent Warm | `#c4a882` |
| Accent Sage | `#6b8f71` |
| Accent Blue | `#5b8bab` |
| Accent Red | `#c4655a` |
| Display Font | Playfair Display |
| Body Font | DM Sans |

---

## 🛒 Redux Store

### Cart Slice
| Action | Description |
|---|---|
| `addItem(CartItem)` | Add or increment quantity |
| `removeItem(variantId)` | Remove item |
| `updateQuantity({variantId, qty})` | Update or remove if 0 |
| `clearCart()` | Empty cart |
| `openCart / closeCart / toggleCart` | Drawer visibility |

### Wishlist Slice
| Action | Description |
|---|---|
| `toggleWishlist(item)` | Add or remove |
| `removeFromWishlist(id)` | Remove by id |

### UI Slice
| Action | Description |
|---|---|
| `toggleTheme()` | Light ↔ Dark |
| `openMobileMenu / closeMobileMenu` | Nav drawer |
| `openSearch / closeSearch` | Search bar |
| `addToast({message, type})` | Show toast (auto-dismiss 2.8s) |

---

## 🔌 Shopify Integration

### Step 1: Add environment variables

```bash
# .env.local
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token_here
```

### Step 2: Get your Shopify credentials

1. Shopify Admin → Settings → Apps → Develop apps
2. Create app → Configure Storefront API
3. Enable permissions: products, inventory, checkouts, customers
4. Copy Storefront API access token

### Step 3: Replace mock data with real API calls

The GraphQL client is ready in `src/shared/lib/shopify.ts`:

```typescript
// All queries already written:
import { shopifyFetch, GET_PRODUCTS, GET_PRODUCT, CREATE_CART, ADD_TO_CART, ... } from '@/shared/lib/shopify'

// Example usage:
const data = await shopifyFetch<{ products: ShopifyProductsData }>({
  query: GET_PRODUCTS,
  variables: { first: 12 },
})
```

Replace `mockProducts` in each page with these calls. The TypeScript types in `src/shared/types/global.types.ts` match the Shopify response shape.

---

## ✅ Pages & Features

- [x] Home — Hero banner, category grid, bestsellers, promo, new arrivals, brand statement
- [x] Shop — Sidebar filters (category, price slider, sale toggle), sort, live product count
- [x] Product Detail — Image gallery, color/size variants, quantity stepper, add to cart, wishlist, reviews, related
- [x] Cart page — Items, quantity controls, coupon input, order summary, shipping threshold
- [x] Cart Drawer — Slide-in from right, fully functional
- [x] Search — Live filtering, tag suggestions
- [x] Auth — Login + Register (Shopify-ready)
- [x] Account Dashboard — Stats, recent orders
- [x] Order History — Full order cards with status badges
- [x] About — Brand story, values, imagery
- [x] Contact — Form with success state
- [x] 404 — Custom not-found page
- [x] Navbar — Sticky, search, dark mode toggle, wishlist + cart badges, mobile menu
- [x] Mobile Menu — Slide-in drawer
- [x] Toast System — Success, error, info (auto-dismiss)
- [x] Dark Mode — Full dark theme, toggle persists in Redux
- [x] Fully Responsive — Mobile-first, 2→3→4 column grid
