'use client'
import { Search, Moon, Sun, ShoppingBag, Menu, Globe, ChevronDown, User, Heart, Package, Settings, MapPin, LogOut } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleCart } from '@/features/cart/store/cartSlice'
import { openSearch, openMobileMenu } from '@/features/ui/store/uiSlice'
import { logoutCustomer } from '@/features/auth/store/authSlice'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/utils/cn'

/* ── Language Switcher ── */
function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ]

  const switchLocale = (locale: string) => {
    setOpen(false)
    if (locale === currentLocale) return
    router.replace(pathname, { locale })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
      >
        <Globe size={18} />
        <span className="text-xs font-medium uppercase hidden sm:block">{currentLocale}</span>
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-soft z-50 overflow-hidden">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                currentLocale === code
                  ? 'bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark font-medium'
                  : 'text-ink-1 dark:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark'
              )}
            >
              {label}
              {currentLocale === code && <span className="text-[10px] opacity-70">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Theme Toggle ── */
function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return (
    <button onClick={toggle} className="p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

/* ── Account Dropdown ── */
function AccountMenu() {
  const dispatch   = useAppDispatch()
  const locale     = useLocale()
  const { customer, accessToken } = useAppSelector(s => s.auth)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const href = (path: string) => path
  const isLoggedIn = !!accessToken && !!customer

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isLoggedIn) {
    return (
      <Link
        href={href('/auth/login')}
        className="p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
      >
        <User size={18} />
      </Link>
    )
  }

  const firstName = customer.firstName || customer.email.split('@')[0]

  const MENU_ITEMS = [
    { icon: Package,  label: 'Orders',    href: href('/account/orders')    },
    { icon: Heart,    label: 'Wishlist',  href: href('/account/wishlist')  },
    { icon: MapPin,   label: 'Addresses', href: href('/account/addresses') },
    { icon: Settings, label: 'Settings',  href: href('/account/settings')  },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
      >
        <div className="w-6 h-6 rounded-full bg-brand-dark dark:bg-brand-light flex items-center justify-center text-[11px] font-bold text-brand-light dark:text-brand-dark flex-shrink-0">
          {firstName[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">{firstName}</span>
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-soft z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
            <p className="text-xs font-semibold text-ink-1 dark:text-ink-dk1 truncate">{firstName}</p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 truncate">{customer.email}</p>
          </div>
          {MENU_ITEMS.map(({ icon: Icon, label, href: h }) => (
            <Link
              key={label}
              href={h}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-1 dark:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <Icon size={15} className="text-ink-2 dark:text-ink-dk2 flex-shrink-0" />
              {label}
            </Link>
          ))}
          <div className="border-t border-border-light dark:border-border-dark">
            <button
              onClick={() => { setOpen(false); dispatch(logoutCustomer()) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-red hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <LogOut size={15} className="flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Navbar ── */
export default function Navbar() {
  const t         = useTranslations('nav')
  const dispatch  = useAppDispatch()
  const pathname  = usePathname()
  const cartCount = useAppSelector(s => s.cart.totalQuantity)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const NAV_LINKS = [
    { href: '/shop',                     label: t('shop')        },
    { href: '/collections/new-arrivals', label: t('collections') },
    { href: '/about',                    label: t('about')       },
    { href: '/contact',                  label: t('contact')     },
  ]

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm shadow-soft border-b border-border-light dark:border-border-dark'
        : 'bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark'
    )}>
      <div className="bg-brand-dark text-brand-light text-center py-2 text-xs font-medium tracking-wide">
        Free shipping on orders over $150 · Livraison gratuite dès 150$
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => dispatch(openMobileMenu())}
            className="lg:hidden p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark text-ink-1 dark:text-ink-dk1"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="font-display text-2xl font-bold text-brand-dark dark:text-brand-light flex-shrink-0">
            Camiecom
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ href: h, label }) => (
              <Link key={h} href={h}
                className={cn(
                  'text-sm font-medium transition-colors py-1',
                  pathname === h ? 'text-brand-warm' : 'text-ink-1 dark:text-ink-dk1 hover:text-brand-warm'
                )}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <button
              onClick={() => dispatch(openSearch())}
              className="p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            <AccountMenu />
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-[10px] font-bold rounded-pill flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}