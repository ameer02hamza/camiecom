import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-11 px-4 text-sm border rounded-btn bg-transparent transition-colors',
          'text-ink-1 dark:text-ink-dk1 placeholder:text-ink-2 dark:placeholder:text-ink-dk2',
          'focus:outline-none',
          error
            ? 'border-brand-red focus:border-brand-red'
            : 'border-border-light dark:border-border-dark focus:border-brand-dark dark:focus:border-brand-light',
          className
        )}
        {...props}
      />
      {hint  && !error && <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-1">{hint}</p>}
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export default Input
