import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Toast, Theme } from '@/shared/types/global.types'

interface UIState {
  theme: Theme
  mobileMenuOpen: boolean
  searchOpen: boolean
  toasts: Toast[]
}

// localStorage se theme read karo — SSR safe
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('camie_theme') as Theme
    if (saved === 'dark' || saved === 'light') return saved
    // System preference check
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'light'
  } catch {}
  return 'light'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light' as Theme, // server side default — client pe AppRestorer override karega
    mobileMenuOpen: false,
    searchOpen: false,
    toasts: [] as Toast[],
  },
  reducers: {
    setTheme(state, a: PayloadAction<Theme>) {
      state.theme = a.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('camie_theme', a.payload)
        // html element pe dark class lagao/hatao
        document.documentElement.classList.toggle('dark', a.payload === 'dark')
      }
    },
    toggleTheme(state) {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = next
      if (typeof window !== 'undefined') {
        localStorage.setItem('camie_theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
      }
    },
    openMobileMenu(state)  { state.mobileMenuOpen = true  },
    closeMobileMenu(state) { state.mobileMenuOpen = false },
    openSearch(state)      { state.searchOpen = true  },
    closeSearch(state)     { state.searchOpen = false },
    addToast(state, a: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...a.payload, id: Date.now().toString() })
    },
    removeToast(state, a: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== a.payload)
    },
  },
})

export { getInitialTheme }
export const {
  setTheme, toggleTheme,
  openMobileMenu, closeMobileMenu,
  openSearch, closeSearch,
  addToast, removeToast,
} = uiSlice.actions
export const uiReducer = uiSlice.reducer
