import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WishlistItem } from '@/shared/types/global.types'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] as WishlistItem[] },
  reducers: {
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id)
      if (idx >= 0) state.items.splice(idx, 1)
      else state.items.push(action.payload)
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
  },
})
export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions
export const wishlistReducer = wishlistSlice.reducer
