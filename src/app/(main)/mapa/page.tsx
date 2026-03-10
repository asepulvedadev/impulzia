import type { Metadata } from 'next'
import { MapaCucuta } from '@/components/map/MapaCucuta'

export const metadata: Metadata = {
  title: 'Mapa de Negocios — Cúcuta | Impulzia',
  description:
    'Explora los negocios locales de Cúcuta por comunas y barrios. Descubre emprendimientos cerca de ti.',
}

export default function MapaPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white md:text-3xl">
            Mapa de Cúcuta
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Explora negocios locales por comunas y barrios
          </p>
        </div>

        {/* Map — height accounts for bottom nav on mobile */}
        <MapaCucuta className="h-[calc(100dvh-8rem)] w-full shadow-2xl sm:h-[calc(100vh-10rem)]" />
      </div>
    </main>
  )
}
