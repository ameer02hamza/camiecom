'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, UserRound, LogOut, Package, Heart, MapPin, Settings } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeMobileMenu } from '@/features/ui/store/uiSlice'
import { logoutCustomer } from '@/features/auth/store/authSlice'

const NAV_LINKS = [
  { href: '/shop',                     label: 'Shop All'    },
  { href: '/collections/new-arrivals', label: 'New Arrivals' },
  { href: '/about',                    label: 'About'       },
  { href: '/contact',                  label: 'Contact'     },
]

const ACCOUNT_LINKS = [
  { href: '/account',           label: 'My Account', icon: UserRound },
  { href: '/account/orders',    label: 'Orders',     icon: Package   },
  { href: '/account/wishlist',  label: 'Wishlist',   icon: Heart     },
  { href: '/account/addresses', label: 'Addresses',  icon: MapPin    },
  { href: '/account/settings',  label: 'Settings',   icon: Settings  },
]

export default function MobileMenu() {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const isOpen   = useAppSelector(s => s.ui.mobileMenuOpen)
  const customer = useAppSelector(s => s.auth.customer)

  const close = () => dispatch(closeMobileMenu())

  const handleLogout = async () => {
    close()
    await dispatch(logoutCustomer())
    router.push('/')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-surface-light dark:bg-surface-dark animate-slide-right flex flex-col shadow-hover overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <span className="font-display text-xl font-bold">Menu</span>
          <button
            onClick={close}
            className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 flex flex-col gap-6">

          {/* Main nav */}
          <nav className="space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={close}
                className="block py-3 text-lg font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm dark:hover:text-brand-warm border-b border-border-light/50 dark:border-border-dark/50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          {customer ? (
            <div>
              {/* User info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                <div className="w-9 h-9 rounded-pill bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {`${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 truncate">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-xs text-ink-2 dark:text-ink-dk2 truncate">{customer.email}</p>
                </div>
              </div>

              {/* Account links */}
              <div className="space-y-1">
                {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex items-center gap-3 py-2.5 text-sm text-ink-1 dark:text-ink-dk1 hover:text-brand-warm dark:hover:text-brand-warm transition-colors"
                  >
                    <Icon size={16} className="text-ink-2 dark:text-ink-dk2 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark w-full text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} className="flex-shrink-0" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-ink-2 dark:text-ink-dk2 uppercase tracking-label font-medium">Account</p>
              <Link
                href="/auth/login"
                onClick={close}
                className="flex items-center gap-3 py-2.5 text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors"
              >
                <UserRound size={16} className="text-ink-2 dark:text-ink-dk2" />
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={close}
                className="flex items-center gap-3 py-2.5 text-sm font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors"
              >
                <UserRound size={16} className="text-ink-2 dark:text-ink-dk2" />
                Create Account
              </Link>
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-border-light dark:border-border-dark flex-shrink-0">
          <p className="text-xs text-ink-2 dark:text-ink-dk2 text-center">Dress with intention</p>
        </div>
      </div>
    </div>
  )
}
