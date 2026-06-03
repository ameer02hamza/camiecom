'use client'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { restoreCart } from '@/features/cart/store/cartSlice'

function CartRestorer() {
  useEffect(() => { store.dispatch(restoreCart()) }, [])
  return null
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartRestorer />
      {children}
    </Provider>
  )
}
