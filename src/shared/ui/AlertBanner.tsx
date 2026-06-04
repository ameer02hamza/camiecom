import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type AlertType = 'success' | 'error' | 'info'

interface AlertBannerProps {
  type: AlertType
  message: string
  className?: string
  onDismiss?: () => void
}

const config: Record<AlertType, { bg: string; border: string; text: string; Icon: typeof CheckCircle }> = {
  success: { bg: 'bg-brand-sage/10', border: 'border-brand-sage/20', text: 'text-brand-sage', Icon: CheckCircle },
  error:   { bg: 'bg-brand-red/10',  border: 'border-brand-red/20',  text: 'text-brand-red',  Icon: AlertCircle },
  info:    { bg: 'bg-brand-warm/10', border: 'border-brand-warm/20', text: 'text-brand-warm', Icon: Info },
}

export default function AlertBanner({ type, message, className, onDismiss }: AlertBannerProps) {
  const { bg, border, text, Icon } = config[type]
  return (
    <div className={cn('flex items-center gap-2 border text-sm rounded-card px-4 py-3', bg, border, text, className)}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
