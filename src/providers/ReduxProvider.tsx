'use client'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { restoreCart } from '@/features/cart/store/cartSlice'
import { fetchCurrentUser } from '@/features/auth/store/authSlice'
import { setTheme, getInitialTheme } from '@/features/ui/store/uiSlice'
import { restoreWishlist } from '@/features/wishlist/store/wishlistSlice'

function AppRestorer() {
  useEffect(() => {
    // 1. Theme — localStorage se read karo, html class lagao
    const savedTheme = getInitialTheme()
    store.dispatch(setTheme(savedTheme))

    // 2. Cart restore
    store.dispatch(restoreCart())

    // 3. Wishlist restore
    store.dispatch(restoreWishlist())

    // 4. Auth session check
    store.dispatch(fetchCurrentUser())
  }, [])
  return null
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppRestorer />
      {children}
    </Provider>
  )
}
