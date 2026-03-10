'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/modules/negocios/interfaces'

interface HeroSliderProps {
  slides: HeroSlide[]
  coverUrl: string | null
  businessName: string
  brandPrimary: string
  brandSecondary: string
  logoUrl: string | null
  isVerified: boolean
  categoryName: string | null
  isOwner: boolean
  onAddSlide?: () => void
}

export function HeroSlider({
  slides,
  coverUrl,
  businessName,
  brandPrimary,
  brandSecondary,
  logoUrl,
  isVerified,
  categoryName,
  isOwner,
  onAddSlide,
}: HeroSliderProps) {
  const images: string[] = slides.length > 0
    ? slides.map((s) => s.url)
    : coverUrl
    ? [coverUrl]
    : []

  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(images.length, 1))
  }, [images.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [images.length, next])

  const initial = businessName.charAt(0).toUpperCase()

  return (
    <section className="relative h-[70vh] min-h-[400px] max-h-[700px] overflow-hidden">
      {/* Slides */}
      {images.length > 0 ? (
        images.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={businessName} className="h-full w-full object-cover" />
          </div>
        ))
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandSecondary})` }}
        >
          <span className="select-none text-[12rem] font-black text-white/10">{initial}</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '6px',
                background: i === current ? brandPrimary : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Add slide button (owner only) */}
      {isOwner && (
        <button
          onClick={onAddSlide}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          + Agregar foto
        </button>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="mx-auto flex max-w-5xl items-end gap-4">
          {/* Logo */}
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName}
              className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/20 object-cover shadow-2xl sm:h-24 sm:w-24"
            />
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 text-3xl font-black text-white shadow-2xl sm:h-24 sm:w-24"
              style={{ background: brandPrimary }}
            >
              {initial}
            </div>
          )}

          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-black text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
                {businessName}
              </h1>
              {isVerified && (
                <svg className="h-6 w-6 shrink-0 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            {categoryName && (
              <span
                className="mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-semibold text-white"
                style={{ background: `${brandPrimary}cc` }}
              >
                {categoryName}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
