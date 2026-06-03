import { configureStore } from '@reduxjs/toolkit'
import cartReducer     from '@/features/cart/store/cartSlice'
import { wishlistReducer } from '@/features/wishlist/store/wishlistSlice'
import { uiReducer }   from '@/features/ui/store/uiSlice'
import authReducer     from '@/features/auth/store/authSlice'

export const store = configureStore({
  reducer: {
    cart:     cartReducer,
    wishlist: wishlistReducer,
    ui:       uiReducer,
    auth:     authReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
