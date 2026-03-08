'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
    alt: 'Negocios locales impulsados por IA',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80',
    alt: 'Conecta con tu comunidad',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80',
    alt: 'Marketplace y publicidad local',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80',
    alt: 'Crece con inteligencia artificial',
  },
]

const AUTOPLAY_INTERVAL = 4500

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent((index + SLIDES.length) % SLIDES.length)
      setTimeout(() => setIsTransitioning(false), 600)
    },
    [isTransitioning]
  )

  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    const timer = setInterval(() => {
      goTo(current + 1)
    }, AUTOPLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [current, goTo])

  return (
    <section className="flex justify-center py-8 px-4 lg:py-12">
      <div className="relative w-[85%] overflow-hidden rounded-3xl shadow-2xl">
        {/* Slides */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/7] w-full">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* subtle dark overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
            </div>
          ))}
        </div>

        {/* Prev button */}
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next button */}
        <button
          onClick={next}
          aria-label="Siguiente slide"
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Ir al slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                index === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
