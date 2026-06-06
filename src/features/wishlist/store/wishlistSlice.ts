import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WishlistItem } from '@/shared/types/global.types'

const STORAGE_KEY = 'camie_wishlist'

function loadWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] as WishlistItem[] },
  reducers: {
    restoreWishlist(state) {
      state.items = loadWishlist()
    },
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id)
      if (idx >= 0) state.items.splice(idx, 1)
      else state.items.push(action.payload)
      saveWishlist(state.items)
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
      saveWishlist(state.items)
    },
  },
})

export const { restoreWishlist, toggleWishlist, removeFromWishlist } = wishlistSlice.actions
export const wishlistReducer = wishlistSlice.reducer
