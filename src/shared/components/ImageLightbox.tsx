'use client'
import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { ProductImage } from '@/shared/types/global.types'

interface ImageLightboxProps {
  images: ProductImage[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ImageLightbox({ images, activeIndex, onClose, onNavigate }: ImageLightboxProps) {
  const prev = useCallback(() => onNavigate((activeIndex - 1 + images.length) % images.length), [activeIndex, images.length, onNavigate])
  const next = useCallback(() => onNavigate((activeIndex + 1) % images.length), [activeIndex, images.length, onNavigate])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handler)
    }
  }, [onClose, prev, next])

  if (!images.length) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Main image */}
      <div
        className="relative z-10 max-w-4xl max-h-[85vh] w-full mx-16"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-[80vh]">
          <Image
            key={activeIndex}
            src={images[activeIndex]?.url || ''}
            alt={images[activeIndex]?.altText || ''}
            fill
            className="object-contain animate-scale-in"
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
          />
        </div>
      </div>

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onNavigate(i) }}
              className={`relative w-14 h-16 rounded-card overflow-hidden border-2 transition-colors flex-shrink-0 ${
                i === activeIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
              }`}
            >
              <Image src={img.url} alt={img.altText || ''} fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Zoom trigger button — place over the main product image ──────────────────
interface ZoomTriggerProps {
  onClick: () => void
}

export function ZoomTrigger({ onClick }: ZoomTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
      aria-label="Zoom image"
    >
      <ZoomIn size={18} />
    </button>
  )
}
