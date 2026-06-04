'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCustomer } from '@/features/auth/store/authSlice'

export function useAuthGuard() {
  const dispatch    = useAppDispatch()
  const router      = useRouter()
  const { customer, accessToken, loading } = useAppSelector(s => s.auth)

  useEffect(() => {
    if (!accessToken) { router.replace('/auth/login'); return }
    if (!customer && accessToken) dispatch(fetchCustomer(accessToken))
  }, [accessToken, customer, dispatch, router])

  return { customer, accessToken, loading }
}
