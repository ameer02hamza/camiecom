import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CartItem } from '@/shared/types/global.types'
import {
  shopifyFetch,
  CREATE_CART,
  ADD_TO_CART,
  UPDATE_CART_LINE,
  REMOVE_CART_LINE,
  GET_CART,
  UPDATE_BUYER_IDENTITY,
} from '@/shared/lib/shopify'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[]
  totalQuantity: number
  totalAmount: number
  isOpen: boolean
  isLoading: boolean
  cartId: string | null
  checkoutUrl: string | null
  error: string | null
}

interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: { amount: string; currencyCode: string }
    product: {
      title: string
      handle: string
      featuredImage: { url: string; altText: string } | null
    }
  }
}

interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: { edges: { node: ShopifyCartLine }[] }
  cost: {
    subtotalAmount: { amount: string; currencyCode: string }
    totalAmount: { amount: string; currencyCode: string }
  }
}

// ─── localStorage helpers (SSR safe) ─────────────────────────────────────────

function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem('shopify_cart_id') } catch { return null }
}
function setStoredCartId(id: string) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('shopify_cart_id', id) } catch { }
}
function clearStoredCartId() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem('shopify_cart_id') } catch { }
}

// ─── Shopify cart → Redux state mapper ───────────────────────────────────────

function mapCart(cart: ShopifyCart) {
  const items: CartItem[] = cart.lines.edges.map(({ node }) => ({
    lineId: node.id,
    variantId: node.merchandise.id,
    productId: node.merchandise.id,
    handle: node.merchandise.product?.handle ?? '',
    title: node.merchandise.product?.title ?? node.merchandise.title,
    variantTitle: node.merchandise.title,
    price: parseFloat(node.merchandise.price.amount),
    image: node.merchandise.product?.featuredImage?.url ?? '',
    quantity: node.quantity,
  }))

  const checkoutUrl = cart.checkoutUrl ?? ''

  return {
    items,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
    totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
    cartId: cart.id,
    checkoutUrl,
  }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  isOpen: false,
  isLoading: false,
  cartId: getStoredCartId(),
  checkoutUrl: null,
  error: null,
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Restore existing cart from Shopify on page load
export const restoreCart = createAsyncThunk('cart/restore', async (_, { rejectWithValue }) => {
  const cartId = getStoredCartId()
  if (!cartId) return null
  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: GET_CART, variables: { cartId }, cache: 'no-store',
    })
    if (!data.cart) { clearStoredCartId(); return null }
    return mapCart(data.cart)
  } catch {
    clearStoredCartId(); return null
  }
})

// Helper — silently attach buyer identity (email) to cart for Shopify checkout prefill
async function attachBuyerIdentity(cartId: string, email: string) {
  try {
    await shopifyFetch({
      query: UPDATE_BUYER_IDENTITY,
      variables: { cartId, buyerIdentity: { email } },
      cache: 'no-store',
    })
  } catch {} // non-critical, ignore errors
}

// Add to cart — creates new cart if none, else adds line
export const shopifyAddToCart = createAsyncThunk(
  'cart/add',
  async (payload: { variantId: string; quantity: number }, { getState, rejectWithValue }) => {
    const state   = getState() as { cart: CartState; auth: { customer: { email: string } | null } }
    const { cartId } = state.cart
    const email      = state.auth.customer?.email ?? null
    const line = { merchandiseId: payload.variantId, quantity: payload.quantity }
    try {
      if (!cartId) {
        const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>({
          query: CREATE_CART, variables: { lines: [line] }, cache: 'no-store',
        })
        const cart = data.cartCreate.cart
        setStoredCartId(cart.id)
        if (email) await attachBuyerIdentity(cart.id, email)
        return mapCart(cart)
      } else {
        const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>({
          query: ADD_TO_CART, variables: { cartId, lines: [line] }, cache: 'no-store',
        })
        if (email) await attachBuyerIdentity(cartId, email)
        return mapCart(data.cartLinesAdd.cart)
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add to cart')
    }
  }
)

// Update quantity of an existing line
export const shopifyUpdateCartLine = createAsyncThunk(
  'cart/update',
  async (payload: { lineId: string; quantity: number }, { getState, rejectWithValue }) => {
    const { cartId } = (getState() as { cart: CartState }).cart
    if (!cartId) return rejectWithValue('No cart')
    try {
      const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>({
        query: UPDATE_CART_LINE,
        variables: { cartId, lines: [{ id: payload.lineId, quantity: payload.quantity }] },
        cache: 'no-store',
      })
      return mapCart(data.cartLinesUpdate.cart)
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update cart')
    }
  }
)

// Remove a line from cart
export const shopifyRemoveFromCart = createAsyncThunk(
  'cart/remove',
  async (lineId: string, { getState, rejectWithValue }) => {
    const { cartId } = (getState() as { cart: CartState }).cart
    if (!cartId) return rejectWithValue('No cart')
    try {
      const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>({
        query: REMOVE_CART_LINE,
        variables: { cartId, lineIds: [lineId] },
        cache: 'no-store',
      })
      return mapCart(data.cartLinesRemove.cart)
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to remove from cart')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

function applyCart(state: CartState, result: ReturnType<typeof mapCart>) {
  state.items = result.items
  state.totalQuantity = result.totalQuantity
  state.totalAmount = result.totalAmount
  state.cartId = result.cartId
  state.checkoutUrl = result.checkoutUrl
  state.isLoading = false
  state.error = null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) {
      state.items = []; state.totalQuantity = 0; state.totalAmount = 0
      state.cartId = null; state.checkoutUrl = null
      clearStoredCartId()
    },
    openCart(state) { state.isOpen = true },
    closeCart(state) { state.isOpen = false },
    toggleCart(state) { state.isOpen = !state.isOpen },
    clearError(state) { state.error = null },
  },
  extraReducers: builder => {
    builder.addCase(restoreCart.fulfilled, (state, action) => {
      if (action.payload) applyCart(state, action.payload)
    })

    builder
      .addCase(shopifyAddToCart.pending, state => { state.isLoading = true; state.error = null })
      .addCase(shopifyAddToCart.fulfilled, (state, action) => {
        applyCart(state, action.payload)
      })
      .addCase(shopifyAddToCart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    builder
      .addCase(shopifyUpdateCartLine.pending, state => { state.isLoading = true; state.error = null })
      .addCase(shopifyUpdateCartLine.fulfilled, (state, action) => { if (action.payload) applyCart(state, action.payload) })
      .addCase(shopifyUpdateCartLine.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    builder
      .addCase(shopifyRemoveFromCart.pending, state => { state.isLoading = true; state.error = null })
      .addCase(shopifyRemoveFromCart.fulfilled, (state, action) => { if (action.payload) applyCart(state, action.payload) })
      .addCase(shopifyRemoveFromCart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
  },
})

export const { clearCart, openCart, closeCart, toggleCart, clearError } = cartSlice.actions
export default cartSlice.reducer