'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/utils/cn'
import { Badge } from '@/shared/ui/Badge'
import ImageLightbox from '@/shared/components/ImageLightbox'
import type { ProductImage } from '@/shared/types/global.types'

interface Props {
  images: ProductImage[]
  title: string
  isSale?: boolean
  isNew?: boolean
  isBestseller?: boolean
  savingsPercent?: number
}

// Lens size on the actual image (px)
const LENS_W    = 160
const LENS_H    = 160
// Zoom multiplier — higher = more zoomed in the panel
const ZOOM      = 3

export default function ProductImageGallery({ images, title, isSale, isNew, isBestseller, savingsPercent }: Props) {
  const [activeImage, setActiveImage]   = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zooming, setZooming]           = useState(false)
  // lens top-left position relative to container (px)
  const [lensPos, setLensPos]           = useState({ x: 0, y: 0 })
  // background-position for the zoom panel (%)
  const [bgPos, setBgPos]               = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // clamp so lens stays fully inside image
    const halfW = LENS_W / 2
    const halfH = LENS_H / 2
    const cx = Math.max(halfW, Math.min(rect.width  - halfW, mouseX))
    const cy = Math.max(halfH, Math.min(rect.height - halfH, mouseY))

    setLensPos({ x: cx - halfW, y: cy - halfH })

    // percentage for background-position of zoom panel
    // same formula Amazon uses: maps cursor pct → zoom panel bg pct
    const pctX = ((cx - halfW) / (rect.width  - LENS_W)) * 100
    const pctY = ((cy - halfH) / (rect.height - LENS_H)) * 100
    setBgPos({ x: Math.max(0, Math.min(100, pctX)), y: Math.max(0, Math.min(100, pctY)) })
  }, [])

  const currentImage = images[activeImage]

  return (
    // outer wrapper — position:relative so zoom panel can be placed absolutely
    <div className="relative space-y-4">

      {/* ── Main image + lens overlay ── */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] rounded-card overflow-hidden bg-border-light dark:bg-border-dark shadow-soft select-none"
        style={{ cursor: zooming ? 'crosshair' : 'zoom-in' }}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => { if (!zooming) setLightboxOpen(true) }}
      >
        {/* Base image */}
        {currentImage?.url && (
          <Image
            src={currentImage.url}
            alt={title}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width:1024px) 100vw, 50vw"
            draggable={false}
          />
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {isSale && savingsPercent && savingsPercent > 0 && (
            <Badge label={`Save ${savingsPercent}%`} variant="sale" />
          )}
          {isNew && <Badge label="New Arrival" variant="new" />}
          {isBestseller && <Badge label="Bestseller" variant="bestseller" />}
        </div>

        {/* Lens square on the image */}
        {zooming && currentImage?.url && (
          <div
            className="absolute pointer-events-none border border-white/50 bg-white/10 backdrop-blur-[1px] z-20"
            style={{
              width:  LENS_W,
              height: LENS_H,
              top:    lensPos.y,
              left:   lensPos.x,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.18)',
            }}
          />
        )}

        {/* Hint */}
        <div
          className={cn(
            'absolute bottom-3 right-3 text-[11px] text-white/80 bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-pill pointer-events-none transition-opacity duration-200 z-10',
            zooming ? 'opacity-0' : 'opacity-100'
          )}
        >
          Hover to zoom · Click to expand
        </div>
      </div>

      {/* ── Amazon-style zoom panel — floats to the right ── */}
      {zooming && currentImage?.url && (
        <div
          className="absolute top-0 left-[calc(100%+16px)] rounded-card overflow-hidden border border-border-light dark:border-border-dark shadow-hover z-50 pointer-events-none hidden lg:block"
          style={{
            width:           460,
            height:          460,
            backgroundImage: `url(${currentImage.url})`,
            backgroundRepeat:'no-repeat',
            backgroundSize:  `${ZOOM * 100}%`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          }}
        />
      )}

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                'relative w-20 h-24 flex-shrink-0 rounded-card overflow-hidden border-2 transition-colors',
                activeImage === i
                  ? 'border-brand-dark dark:border-brand-light'
                  : 'border-transparent hover:border-border-light dark:hover:border-border-dark'
              )}
            >
              <Image src={img.url} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(i) => setActiveImage(i)}
        />
      )}
    </div>
  )
}