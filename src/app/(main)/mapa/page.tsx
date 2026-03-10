import type { Metadata } from 'next'
import { MapaCucuta } from '@/components/map/MapaCucuta'

export const metadata: Metadata = {
  title: 'Mapa de Negocios — Cúcuta | Impulzia',
  description:
    'Explora los negocios locales de Cúcuta por comunas y barrios. Descubre emprendimientos cerca de ti.',
}

export default function MapaPage() {
  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col sm:h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-2rem)]">
      {/* Header */}
      <div className="mb-3 shrink-0">
        <h1 className="text-lg font-bold text-white sm:text-2xl">Mapa de Cúcuta</h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          Explora negocios locales por comunas y barrios
        </p>
      </div>

      {/* Map — fills remaining space */}
      <MapaCucuta className="min-h-0 flex-1 w-full shadow-2xl" />
    </div>
  )
}
