'use client'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/shared/utils/cn'
import { useTranslations } from 'next-intl'

interface SizeGuideModalProps { isOpen: boolean; onClose: () => void }

const sizes = [
  { size: 'XS', uk: '6',  eu: '34', us: '2',  bust: '81–84', waist: '63–66', hips: '88–91' },
  { size: 'S',  uk: '8',  eu: '36', us: '4',  bust: '85–88', waist: '67–70', hips: '92–95' },
  { size: 'M',  uk: '10', eu: '38', us: '6',  bust: '89–92', waist: '71–74', hips: '96–99' },
  { size: 'L',  uk: '12', eu: '40', us: '8',  bust: '93–96', waist: '75–78', hips: '100–103' },
  { size: 'XL', uk: '14', eu: '42', us: '10', bust: '97–100', waist: '79–82', hips: '104–107' },
]

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const t = useTranslations('size_guide')

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const headers = [t('header_size'), t('header_uk'), t('header_eu'), t('header_us'), t('header_bust'), t('header_waist'), t('header_hips')]

  const measurements = [
    { label: t('bust_label'),  desc: t('bust_desc') },
    { label: t('waist_label'), desc: t('waist_desc') },
    { label: t('hips_label'),  desc: t('hips_desc') },
  ]

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-panel shadow-hover max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light dark:bg-surface-dark">
            <div>
              <h2 className="font-display text-2xl tracking-heading text-ink-1 dark:text-ink-dk1">{t('title')}</h2>
              <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">{t('measurements_note')}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-btn text-ink-2 dark:text-ink-dk2 hover:bg-border-light dark:hover:bg-border-dark transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark">
                    {headers.map(h => <th key={h} className="text-left py-3 pr-4 font-semibold text-ink-1 dark:text-ink-dk1 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {sizes.map((row, i) => (
                    <tr key={row.size} className={cn('transition-colors', i % 2 === 0 ? 'bg-bg-light/50 dark:bg-bg-dark/30' : '')}>
                      <td className="py-3 pr-4 font-bold text-ink-1 dark:text-ink-dk1">{row.size}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.uk}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.eu}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.us}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.bust}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.waist}</td>
                      <td className="py-3 pr-4 text-ink-2 dark:text-ink-dk2">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-bg-light dark:bg-bg-dark rounded-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">{t('how_to_measure')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {measurements.map(({ label, desc }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-brand-warm mb-1">{label}</p>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-ink-2 dark:text-ink-dk2 border-t border-border-light dark:border-border-dark pt-4">
              <span className="font-medium text-ink-1 dark:text-ink-dk1">{t('between_sizes')}</span>{' '}
              {t('between_sizes_tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
