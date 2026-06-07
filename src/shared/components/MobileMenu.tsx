'use client'
import { useLocale } from 'next-intl'
import {
  X, UserRound, LogOut, Package, Heart, MapPin, Settings, Globe,
  ShoppingBag, Search, Home, Info, Phone, ChevronRight, Moon, Sun,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeMobileMenu, openSearch } from '@/features/ui/store/uiSlice'
import { toggleCart } from '@/features/cart/store/cartSlice'
import { logoutCustomer } from '@/features/auth/store/authSlice'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'
import { Link, usePathname, useRouter } from '@/i18n/navigation'

/* ── Section Header ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-2 dark:text-ink-dk2 px-4 mb-1">
      {children}
    </p>
  )
}

/* ── Menu Row ── */
function MenuRow({
  href,
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  href?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  label: string
  onClick?: () => void
  accent?: 'red' | 'default'
}) {
  const base = cn(
    'flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group',
    accent === 'red'
      ? 'text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30'
      : 'text-ink-1 dark:text-ink-dk1 hover:bg-border-light dark:hover:bg-border-dark'
  )

  const content = (
    <>
      {Icon && (
        <span className={cn(
          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          accent === 'red'
            ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
            : 'bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2'
        )}>
          <Icon size={15} />
        </span>
      )}
      <span className="flex-1 text-left">{label}</span>
      {accent !== 'red' && (
        <ChevronRight size={14} className="text-ink-2 dark:text-ink-dk2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-150" />
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={base}>
        {content}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={base}>
      {content}
    </button>
  )
}

/* ── Main MobileMenu ── */
export default function MobileMenu() {
  const dispatch   = useAppDispatch()
  const router     = useRouter()
  const pathname   = usePathname()
  const isOpen     = useAppSelector(s => s.ui.mobileMenuOpen)
  const customer   = useAppSelector(s => s.auth.customer)
  const cartCount  = useAppSelector(s => s.cart.totalQuantity)
  const t          = useTranslations('nav')
  const locale     = useLocale()
  const [dark, setDark] = useState(false)

  const href = (path: string) => path

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(saved === 'dark' || (!saved && prefersDark))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const close = () => dispatch(closeMobileMenu())

  const handleLogout = async () => {
    close()
    await dispatch(logoutCustomer())
    router.replace('/')
  }

  const switchLocale = (targetLocale: string) => {
    close()
    if (targetLocale === locale) return
    router.replace(pathname, { locale: targetLocale })
  }

  const handleSearch = () => {
    close()
    dispatch(openSearch())
  }

  const handleCart = () => {
    close()
    dispatch(toggleCart())
  }

  if (!isOpen) return null

  const firstName = customer
    ? (customer.firstName || customer.email.split('@')[0])
    : null

  const initials = customer
    ? (`${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase() || 'U')
    : null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-surface-light dark:bg-surface-dark animate-slide-right flex flex-col shadow-2xl overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
          <Link href={href('/')} onClick={close} className="font-display text-xl font-bold text-brand-dark dark:text-brand-light">
            Camiecom
          </Link>
          <button
            onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-colors text-ink-1 dark:text-ink-dk1"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto py-3 space-y-5">

          {/* ── Quick Actions ── */}
          <div className="px-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-3 py-3 bg-border-light dark:bg-border-dark rounded-xl text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:bg-border-light/70 dark:hover:bg-border-dark/70 transition-colors"
              >
                <Search size={16} className="text-ink-2 dark:text-ink-dk2" />
                {locale === 'fr' ? 'Rechercher' : 'Search'}
              </button>
              <button
                onClick={handleCart}
                className="flex items-center gap-2 px-3 py-3 bg-border-light dark:bg-border-dark rounded-xl text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:bg-border-light/70 dark:hover:bg-border-dark/70 transition-colors"
              >
                <ShoppingBag size={16} className="text-ink-2 dark:text-ink-dk2" />
                {locale === 'fr' ? 'Panier' : 'Cart'}
                {cartCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Navigation ── */}
          <div>
            <SectionLabel>{locale === 'fr' ? 'Navigation' : 'Browse'}</SectionLabel>
            <div className="px-3 space-y-0.5">
              <MenuRow href={href('/')}                          icon={Home}    label={locale === 'fr' ? 'Accueil'     : 'Home'}        onClick={close} />
              <MenuRow href={href('/shop')}                      icon={ShoppingBag} label={t('shop')}                                   onClick={close} />
              <MenuRow href={href('/collections/new-arrivals')}  icon={Package} label={t('collections')}                               onClick={close} />
              <MenuRow href={href('/about')}                     icon={Info}    label={t('about')}                                      onClick={close} />
              <MenuRow href={href('/contact')}                   icon={Phone}   label={t('contact')}                                    onClick={close} />
            </div>
          </div>

          {/* ── Account ── */}
          <div>
            <SectionLabel>{locale === 'fr' ? 'Mon Compte' : 'Account'}</SectionLabel>
            {customer ? (
              <div className="px-3">
                {/* User card */}
                <div className="flex items-center gap-3 px-4 py-3 mb-1 bg-border-light dark:bg-border-dark rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <MenuRow href={href('/account/orders')}    icon={Package}  label={locale === 'fr' ? 'Commandes'  : 'Orders'}    onClick={close} />
                  <MenuRow href={href('/account/wishlist')}  icon={Heart}    label={locale === 'fr' ? 'Favoris'    : 'Wishlist'}  onClick={close} />
                  <MenuRow href={href('/account/addresses')} icon={MapPin}   label={locale === 'fr' ? 'Adresses'   : 'Addresses'} onClick={close} />
                  <MenuRow href={href('/account/settings')}  icon={Settings} label={locale === 'fr' ? 'Paramètres' : 'Settings'}  onClick={close} />
                  <MenuRow
                    icon={LogOut}
                    label={locale === 'fr' ? 'Déconnexion' : 'Sign out'}
                    onClick={handleLogout}
                    accent="red"
                  />
                </div>
              </div>
            ) : (
              <div className="px-3 space-y-0.5">
                <MenuRow href={href('/auth/login')}    icon={UserRound} label={locale === 'fr' ? 'Se connecter'  : 'Sign In'}       onClick={close} />
                <MenuRow href={href('/auth/register')} icon={UserRound} label={locale === 'fr' ? 'Créer un compte' : 'Create Account'} onClick={close} />
              </div>
            )}
          </div>

          {/* ── Language ── */}
          <div>
            <SectionLabel>{locale === 'fr' ? 'Langue' : 'Language'}</SectionLabel>
            <div className="px-3">
              <div className="flex gap-2 p-1 bg-border-light dark:bg-border-dark rounded-xl">
                {[{ code: 'en', label: 'English', flag: '🇬🇧' }, { code: 'fr', label: 'Français', flag: '🇫🇷' }].map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                      locale === code
                        ? 'bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 shadow-sm'
                        : 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1'
                    )}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Appearance ── */}
          <div>
            <SectionLabel>{locale === 'fr' ? 'Apparence' : 'Appearance'}</SectionLabel>
            <div className="px-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 bg-border-light dark:bg-border-dark rounded-xl text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:opacity-80 transition-opacity"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-light dark:bg-surface-dark flex items-center justify-center text-ink-2 dark:text-ink-dk2">
                  {dark ? <Sun size={15} /> : <Moon size={15} />}
                </span>
                <span>{dark ? (locale === 'fr' ? 'Mode clair' : 'Light mode') : (locale === 'fr' ? 'Mode sombre' : 'Dark mode')}</span>
                <span className="ml-auto text-xs text-ink-2 dark:text-ink-dk2 bg-surface-light dark:bg-surface-dark px-2 py-0.5 rounded-md">
                  {dark ? (locale === 'fr' ? 'Activé' : 'On') : (locale === 'fr' ? 'Désactivé' : 'Off')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
          <p className="text-xs text-ink-2 dark:text-ink-dk2 text-center italic">
            {locale === 'fr' ? 'S\'habiller avec intention' : 'Dress with intention'}
          </p>
        </div>
      </div>
    </div>
  )
}