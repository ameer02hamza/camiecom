import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
      <div>
        <p className="font-display text-[120px] font-bold text-border-light dark:text-border-dark leading-none mb-6">404</p>
        <h1 className="font-display text-4xl tracking-heading text-ink-1 dark:text-ink-dk1 mb-3">This page has wandered off</h1>
        <p className="text-ink-2 dark:text-ink-dk2 text-base leading-body mb-10 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="inline-flex items-center gap-2 h-12 px-7 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity">
            Back to Home
          </Link>
          <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-7 border border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 rounded-btn text-sm font-medium hover:border-brand-dark dark:hover:border-brand-light transition-colors">
            Browse Shop <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
