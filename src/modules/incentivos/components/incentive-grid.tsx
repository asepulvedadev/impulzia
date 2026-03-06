import { Tag } from 'lucide-react'
import { IncentiveCard } from './incentive-card'
import type { IncentiveWithBusiness } from '../interfaces'

interface IncentiveGridProps {
  incentives: IncentiveWithBusiness[]
  savedIds?: Set<string>
  onSave?: (id: string) => void
  onRedeem?: (id: string) => void
  emptyMessage?: string
}

export function IncentiveGrid({
  incentives,
  savedIds,
  onSave,
  onRedeem,
  emptyMessage = 'No hay incentivos disponibles en este momento',
}: IncentiveGridProps) {
  if (incentives.length === 0) {
    return (
      <div className="text-center py-16">
        <Tag size={40} className="mx-auto text-muted mb-3 opacity-40" />
        <p className="text-white font-medium">{emptyMessage}</p>
        <p className="text-muted text-sm mt-1">Vuelve pronto para ver nuevas ofertas</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {incentives.map((incentive) => (
        <IncentiveCard
          key={incentive.id}
          incentive={incentive}
          isSaved={savedIds?.has(incentive.id)}
          onSave={onSave}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  )
}

export function IncentiveGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card border border-card-border animate-pulse">
          <div className="h-36 bg-slate-800 rounded-t-xl" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-slate-800 rounded w-16" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
