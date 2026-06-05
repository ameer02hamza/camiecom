import { cn } from '@/shared/utils/cn'

// ── Badge ─────────────────────────────────────────────────────
interface BadgeProps { label: string; variant?: 'sale'|'new'|'bestseller'|'info' }
export function Badge({ label, variant='info' }: BadgeProps) {
  const styles = {
    sale: 'bg-brand-red text-white',
    new: 'bg-brand-blue text-white',
    bestseller: 'bg-brand-warm text-white',
    info: 'bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-medium tracking-label uppercase', styles[variant])}>
      {label}
    </span>
  )
}

// ── Star Rating ───────────────────────────────────────────────
interface StarProps { rate: number; count?: number; size?: 'sm'|'md' }
export function StarRating({ rate, count, size='sm' }: StarProps) {
  const sz = size==='sm'?'w-3 h-3':'w-4 h-4'
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={cn(sz, i<=Math.round(rate)?'text-brand-warm':'text-border-light dark:text-border-dark')} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <span className="text-xs text-ink-2 dark:text-ink-dk2">{rate.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-ink-2 dark:text-ink-dk2">({count})</span>}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
interface SkeletonProps { className?: string }
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('shimmer rounded-card', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-card overflow-hidden">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}

// ── Grid Skeleton (multiple cards) ───────────────────────────
export function ProductGridSkeleton({ count = 8, cols = 4 }: { count?: number; cols?: 2|3|4 }) {
  const gridCls = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[cols]
  return (
    <div className={`grid ${gridCls} gap-4 sm:gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
// ── Account Page Skeleton ─────────────────────────────────────
export function AccountPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-btn" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-card p-5 text-center space-y-3">
            <Skeleton className="w-6 h-6 rounded-full mx-auto" />
            <Skeleton className="h-7 w-8 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
      {/* Nav links */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card divide-y divide-border-light dark:divide-border-dark">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="w-9 h-9 rounded-btn flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
