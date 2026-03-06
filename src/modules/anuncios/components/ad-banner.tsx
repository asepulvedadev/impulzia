'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import type { Ad } from '../interfaces'

interface AdBannerProps {
  ad: Ad
  context?: 'feed' | 'explorer' | 'business_profile' | 'search'
  size?: 'compact' | 'full' | 'hero'
  className?: string
}

const sizeConfig = {
  compact: 'h-32',
  full: 'h-48 md:h-56',
  hero: 'h-64 md:h-80',
}

export function AdBanner({ ad, context = 'feed', size = 'full', className }: AdBannerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const impressionTracked = React.useRef(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !impressionTracked.current) {
          impressionTracked.current = true
          // Fire-and-forget impression tracking
          fetch('/api/ads/track/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId: ad.id, context }),
          }).catch(() => {})
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ad.id, context])

  function handleClick() {
    fetch('/api/ads/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad.id }),
    }).catch(() => {})

    if (ad.cta_url) {
      window.open(ad.cta_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl cursor-pointer group',
        sizeConfig[size],
        className,
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Anuncio: ${ad.title}`}
    >
      {/* Background image or gradient */}
      {ad.image_url ? (
        <Image
          src={ad.image_url}
          alt={ad.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-800 to-brand-primary-600" />
      )}

      {/* Dark gradient overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Ad label — subtle top-left badge */}
      <div className="absolute top-2 left-2">
        <span className="text-[10px] text-white/60 bg-black/30 backdrop-blur-sm rounded px-1.5 py-0.5 font-medium tracking-wide uppercase">
          Anuncio
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className={cn(
            'font-bold text-white leading-tight mb-1',
            size === 'hero' ? 'text-xl md:text-2xl' : 'text-base',
          )}
        >
          {ad.title}
        </h3>
        {ad.description && (
          <p className="text-white/80 text-sm line-clamp-2 mb-3">{ad.description}</p>
        )}
        {ad.cta_text && (
          <Button size="sm" variant="accent" className="pointer-events-none" tabIndex={-1}>
            {ad.cta_text}
          </Button>
        )}
      </div>
    </div>
  )
}

export function AdBannerSkeleton({ size = 'full' }: { size?: 'compact' | 'full' | 'hero' }) {
  return <div className={cn('rounded-xl bg-slate-800 animate-pulse', sizeConfig[size])} />
}
