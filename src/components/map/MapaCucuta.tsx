'use client'

// ─── MapaCucuta ────────────────────────────────────────────────────────────────
// Wrapper with dynamic import to skip SSR (Leaflet requires browser APIs).
// Usage:
//   import { MapaCucuta } from '@/components/map/MapaCucuta'
//   <MapaCucuta className="h-[600px] w-full rounded-2xl" />

import dynamic from 'next/dynamic'
import { clsx } from 'clsx'

const MapaCucutaInner = dynamic(
  () => import('./MapaCucutaInner').then((m) => ({ default: m.MapaCucutaInner })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Iniciando mapa...</p>
        </div>
      </div>
    ),
  },
)

interface MapaCucutaProps {
  className?: string
}

export function MapaCucuta({ className }: MapaCucutaProps) {
  return (
    <div className={clsx('overflow-hidden rounded-2xl', className)}>
      <MapaCucutaInner />
    </div>
  )
}
