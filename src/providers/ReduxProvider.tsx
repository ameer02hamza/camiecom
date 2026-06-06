'use client'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { restoreCart } from '@/features/cart/store/cartSlice'
import { fetchCurrentUser } from '@/features/auth/store/authSlice'

function AppRestorer() {
  useEffect(() => {
    // Cart restore karo localStorage se
    store.dispatch(restoreCart())
    // Auth session check karo cookie se — globally on mount
    // Isse Navbar pe bhi user turant dikh ta hai refresh ke baad
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