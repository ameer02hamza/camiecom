'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Shop error:', error) }, [error])
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="w-16 h-16 bg-brand-warm/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <WifiOff size={28} className="text-brand-warm" />
        </div>
        <h2 className="font-display text-3xl tracking-heading text-ink-1 dark:text-ink-dk1 mb-2">
          Couldn't load products
        </h2>
        <p className="text-ink-2 dark:text-ink-dk2 text-sm leading-body mb-8 max-w-xs mx-auto">
          We couldn't connect to our store right now. Please try again.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="inline-flex items-center gap-2 h-11 px-6 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity">
            <RefreshCw size={14} /> Retry
          </button>
          <Link href="/" className="inline-flex items-center gap-2 h-11 px-6 border border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 rounded-btn text-sm font-medium hover:border-brand-dark transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
