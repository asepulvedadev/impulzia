'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

export interface PromoBanner {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  bg_gradient: string | null
  cta_text: string | null
  cta_url: string | null
}

interface PromoBannerSliderProps {
  banners: PromoBanner[]
}

const AUTOPLAY_MS = 5000

export function PromoBannerSlider({ banners }: PromoBannerSliderProps) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || banners.length <= 1) return
      setTransitioning(true)
      setCurrent((index + banners.length) % banners.length)
      setTimeout(() => setTransitioning(false), 500)
    },
    [transitioning, banners.length],
  )

  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => goTo(current + 1), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [current, goTo, banners.length])

  if (banners.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl">
      {/* Slides */}
      <div className="relative aspect-[16/6] sm:aspect-[16/5] w-full">
        {banners.map((banner, i) => {
          const gradient = banner.bg_gradient ?? 'from-brand-primary-600 to-brand-accent-500'
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background */}
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
                <h2 className="font-heading text-xl font-bold text-white drop-shadow sm:text-2xl lg:text-3xl max-w-md">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="mt-2 text-sm text-white/80 max-w-sm sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.cta_text && banner.cta_url && (
                  <div className="mt-4">
                    <Button size="sm" asChild>
                      <Link href={banner.cta_url}>{banner.cta_text}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls — only if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente slide"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
