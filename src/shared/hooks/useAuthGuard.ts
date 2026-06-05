'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCurrentUser } from '@/features/auth/store/authSlice'

export function useAuthGuard() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const { customer, accessToken, loading } = useAppSelector(s => s.auth)

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!customer && !loading && !fetchedRef.current) {
      fetchedRef.current = true
      dispatch(fetchCurrentUser()).then((result) => {
        // No session — login pe bhejo
        if (fetchCurrentUser.rejected.match(result)) {
          router.replace('/auth/login')
        }
      })
    }
  }, [customer, loading, dispatch, router])

  return { customer, accessToken, loading }
}
