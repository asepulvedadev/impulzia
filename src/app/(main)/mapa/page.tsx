import type { Metadata } from 'next'
import { MapaCucuta } from '@/components/map/MapaCucuta'

export const metadata: Metadata = {
  title: 'Mapa de Negocios — Cúcuta | Impulzia',
  description:
    'Explora los negocios locales de Cúcuta por comunas y barrios. Descubre emprendimientos cerca de ti.',
}

export default function MapaPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Mapa de Cúcuta
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Explora negocios locales por comunas y barrios
          </p>
        </div>

        {/* Map — full viewport minus header */}
        <MapaCucuta className="h-[calc(100vh-10rem)] w-full shadow-2xl" />
      </div>
    </main>
  )
}
