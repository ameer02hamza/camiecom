'use client'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeMobileMenu } from '@/features/ui/store/uiSlice'

const LINKS = [
  { href:'/shop', label:'Shop All' },
  { href:'/shop', label:'New Arrivals' },
  { href:'/shop', label:'Sale' },
  { href:'/about', label:'About' },
  { href:'/contact', label:'Contact' },
  { href:'/account', label:'My Account' },
  { href:'/account/orders', label:'Orders' },
]

export default function MobileMenu() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(s => s.ui.mobileMenuOpen)

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => dispatch(closeMobileMenu())} />
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-surface-light dark:bg-surface-dark animate-slide-right flex flex-col shadow-hover">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
          <span className="font-display text-xl font-bold">Menu</span>
          <button onClick={() => dispatch(closeMobileMenu())} className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-6 py-8 space-y-1">
          {LINKS.map(({ href, label }) => (
            <Link key={label} href={href} onClick={() => dispatch(closeMobileMenu())}
              className="block py-3 text-lg font-medium text-ink-1 dark:text-ink-dk1 hover:text-brand-warm dark:hover:text-brand-warm border-b border-border-light/50 dark:border-border-dark/50 transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-6 border-t border-border-light dark:border-border-dark">
          <p className="text-xs text-ink-2 dark:text-ink-dk2 text-center">Dress with intention</p>
        </div>
      </div>
    </div>
  )
}
