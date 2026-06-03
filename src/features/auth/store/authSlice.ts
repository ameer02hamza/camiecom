import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { shopifyFetch, CUSTOMER_LOGIN, CUSTOMER_REGISTER, CUSTOMER_LOGOUT, GET_CUSTOMER, UPDATE_BUYER_IDENTITY } from '@/shared/lib/shopify'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  acceptsMarketing: boolean
  defaultAddress?: string
}

interface AuthState {
  customer: Customer | null
  accessToken: string | null
  expiresAt: string | null
  loading: boolean
  error: string | null
}

// ─── Load from localStorage (SSR safe) ───────────────────────────────────────

function loadFromStorage() {
  if (typeof window === 'undefined') return { accessToken: null, expiresAt: null }
  try {
    return {
      accessToken: localStorage.getItem('shopify_token'),
      expiresAt:   localStorage.getItem('shopify_token_expires'),
    }
  } catch {
    return { accessToken: null, expiresAt: null }
  }
}

const { accessToken, expiresAt } = loadFromStorage()

const initialState: AuthState = {
  customer:    null,
  accessToken: accessToken,
  expiresAt:   expiresAt,
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

// LOGIN
export const loginCustomer = createAsyncThunk(
  'auth/login',
  async (input: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const data = await shopifyFetch<{
        customerAccessTokenCreate: {
          customerAccessToken: { accessToken: string; expiresAt: string } | null
          customerUserErrors: { code: string; field: string[]; message: string }[]
        }
      }>({
        query: CUSTOMER_LOGIN,
        variables: { input },
      })

      const errors = data.customerAccessTokenCreate.customerUserErrors
      if (errors.length > 0) return rejectWithValue(errors[0].message)

      const token = data.customerAccessTokenCreate.customerAccessToken!

      // Save to localStorage
      localStorage.setItem('shopify_token', token.accessToken)
      localStorage.setItem('shopify_token_expires', token.expiresAt)

      // Fetch customer profile
      dispatch(fetchCustomer(token.accessToken))

      // Attach buyer identity to existing cart — pre-fills Shopify native checkout
      const cartId = localStorage.getItem('shopify_cart_id')
      if (cartId) {
        shopifyFetch({
          query: UPDATE_BUYER_IDENTITY,
          variables: { cartId, buyerIdentity: { email: input.email } },
          cache: 'no-store',
        }).catch(() => {}) // non-critical
      }

      return token
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

// FETCH CUSTOMER PROFILE
export const fetchCustomer = createAsyncThunk(
  'auth/fetchCustomer',
  async (customerAccessToken: string, { rejectWithValue }) => {
    try {
      const data = await shopifyFetch<{ customer: Customer }>({
        query: GET_CUSTOMER,
        variables: { customerAccessToken },
      })
      return data.customer
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// LOGOUT
export const logoutCustomer = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState }
    const token = state.auth.accessToken
    if (token) {
      try {
        await shopifyFetch({
          query: CUSTOMER_LOGOUT,
          variables: { customerAccessToken: token },
        })
      } catch {}
    }
    localStorage.removeItem('shopify_token')
    localStorage.removeItem('shopify_token_expires')
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
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(registerCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })

    // LOGIN
    builder
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading     = false
        state.accessToken = action.payload.accessToken
        state.expiresAt   = action.payload.expiresAt
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload as string
      })

    // FETCH CUSTOMER
    builder
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.customer = action.payload
      })

    // LOGOUT
    builder
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.customer    = null
        state.accessToken = null
        state.expiresAt   = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer