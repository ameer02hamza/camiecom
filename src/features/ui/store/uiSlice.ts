import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Toast, Theme } from '@/shared/types/global.types'

interface UIState {
  theme: Theme
  mobileMenuOpen: boolean
  searchOpen: boolean
  toasts: Toast[]
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme:'light' as Theme, mobileMenuOpen:false, searchOpen:false, toasts:[] as Toast[] },
  reducers: {
    setTheme(state, a: PayloadAction<Theme>) { state.theme=a.payload },
    toggleTheme(state) { state.theme = state.theme==='light'?'dark':'light' },
    openMobileMenu(state) { state.mobileMenuOpen=true },
    closeMobileMenu(state) { state.mobileMenuOpen=false },
    openSearch(state) { state.searchOpen=true },
    closeSearch(state) { state.searchOpen=false },
    addToast(state, a: PayloadAction<Omit<Toast,'id'>>) {
      state.toasts.push({ ...a.payload, id: Date.now().toString() })
    },
    removeToast(state, a: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== a.payload)
    },
  },
})
export const { setTheme, toggleTheme, openMobileMenu, closeMobileMenu, openSearch, closeSearch, addToast, removeToast } = uiSlice.actions
export const uiReducer = uiSlice.reducer
