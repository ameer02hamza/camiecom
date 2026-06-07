'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('App error:', error) }, [error])
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h1 className="font-display text-4xl tracking-heading text-ink-1 dark:text-ink-dk1 mb-3">
          Something went wrong
        </h1>
        <p className="text-ink-2 dark:text-ink-dk2 text-base leading-body mb-10 max-w-sm mx-auto">
          An unexpected error occurred. This is usually temporary — try refreshing.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-12 px-7 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={15} /> Try again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 h-12 px-7 border border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 rounded-btn text-sm font-medium hover:border-brand-dark transition-colors">
            Back to Home <ArrowRight size={15} />
          </Link>
        </div>
        {error.digest && <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-8 opacity-50">Error ID: {error.digest}</p>}
      </div>
    </div>
  )
}
