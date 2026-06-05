import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { shopifyFetch, CUSTOMER_REGISTER, CUSTOMER_LOGOUT, UPDATE_BUYER_IDENTITY } from '@/shared/lib/shopify'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  acceptsMarketing: boolean
  defaultAddress?: { id: string } | null
}

interface AuthState {
  customer: Customer | null
  accessToken: string | null
  expiresAt: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  customer:    null,
  accessToken: null,
  expiresAt:   null,
  loading:     false,
  error:       null,
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// REGISTER
export const registerCustomer = createAsyncThunk(
  'auth/register',
  async (input: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    acceptsMarketing?: boolean
  }, { rejectWithValue }) => {
    try {
      const data = await shopifyFetch<{
        customerCreate: {
          customer: Customer | null
          customerUserErrors: { code: string; field: string[]; message: string }[]
        }
      }>({
        query: CUSTOMER_REGISTER,
        variables: { input },
      })
      const errors = data.customerCreate.customerUserErrors
      if (errors.length > 0) return rejectWithValue(errors[0].message)
      return data.customerCreate.customer!
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed')
    }
  }
)

// LOGIN — cookie server pe set hoti hai, token client pe nahi aata
export const loginCustomer = createAsyncThunk(
  'auth/login',
  async (input: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      let data: any
      try { data = await res.json() } catch {
        return rejectWithValue('Unexpected server response.')
      }

      if (!res.ok || !data.success) return rejectWithValue(data.error || 'Login failed')

      // Cookie set ho gayi — ab /api/auth/me se customer fetch karo
      const result = await dispatch(fetchCurrentUser())
      if (fetchCurrentUser.rejected.match(result)) {
        return rejectWithValue('Login succeeded but failed to load profile.')
      }

      // Cart mein buyer identity attach karo
      const cartId = typeof window !== 'undefined' ? localStorage.getItem('shopify_cart_id') : null
      if (cartId && data.accessToken) {
        shopifyFetch({
          query: UPDATE_BUYER_IDENTITY,
          variables: { cartId, buyerIdentity: { email: input.email } },
          cache: 'no-store',
        }).catch(() => {})
      }

      return { expiresAt: data.expiresAt as string }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

// FETCH CURRENT USER — cookie se token server pe padhta hai, client ko token nahi milta
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res  = await fetch('/api/auth/me')
      const data = await res.json()
      // customer null = no valid session
      if (!data.customer) return rejectWithValue('No session')
      return { customer: data.customer as Customer, accessToken: data.accessToken as string }
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// LOGOUT
export const logoutCustomer = createAsyncThunk(
  'auth/logout',
  async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    // REGISTER
    builder
      .addCase(registerCustomer.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(registerCustomer.fulfilled, (state) => { state.loading = false })
      .addCase(registerCustomer.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string })

    // LOGIN
    builder
      .addCase(loginCustomer.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading   = false
        state.expiresAt = action.payload.expiresAt
      })
      .addCase(loginCustomer.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string })

    // FETCH CURRENT USER
    builder
      .addCase(fetchCurrentUser.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading     = false
        state.customer    = action.payload.customer
        state.accessToken = action.payload.accessToken
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading     = false
        state.customer    = null
        state.accessToken = null
        state.expiresAt   = null
      })

    // LOGOUT
    builder
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.customer    = null
        state.accessToken = null
        state.expiresAt   = null
        state.loading     = false
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
