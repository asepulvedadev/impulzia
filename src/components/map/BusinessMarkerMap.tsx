'use client'

import dynamic from 'next/dynamic'
import type { BusinessCard } from '@/modules/negocios/interfaces'

const BusinessMarkerMapInner = dynamic(
  () =>
    import('./BusinessMarkerMapInner').then((m) => ({ default: m.BusinessMarkerMapInner })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary-500 border-t-transparent" />
      </div>
    ),
  },
)

interface BusinessMarkerMapProps {
  businesses: BusinessCard[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  className?: string
}

export function BusinessMarkerMap({
  businesses,
  selectedId,
  onSelect,
  className,
}: BusinessMarkerMapProps) {
  return (
    <div className={className ?? 'h-full w-full overflow-hidden rounded-2xl'}>
      <BusinessMarkerMapInner
        businesses={businesses}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  )
}
