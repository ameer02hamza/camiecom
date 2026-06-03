'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'outline'|'ghost'|'danger'
  size?: 'sm'|'md'|'lg'
  fullWidth?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant='primary', size='md', fullWidth, loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-warm focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-btn'
    const variants = {
      primary: 'bg-brand-dark text-brand-light hover:opacity-90 hover:-translate-y-px active:translate-y-0 dark:bg-ink-dk1 dark:text-ink-1',
      secondary: 'bg-brand-warm text-white hover:opacity-90 hover:-translate-y-px',
      outline: 'border border-border-light dark:border-border-dark text-ink-1 dark:text-ink-dk1 hover:border-brand-dark dark:hover:border-ink-dk1 hover:bg-surface-light dark:hover:bg-surface-dark',
      ghost: 'text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 hover:bg-border-light/60 dark:hover:bg-border-dark/60',
      danger: 'bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white',
    }
    const sizes = { sm:'h-8 px-3 text-xs', md:'h-10 px-5 text-sm', lg:'h-12 px-8 text-base' }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], fullWidth&&'w-full', className)} disabled={disabled||loading} {...props}>
        {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
