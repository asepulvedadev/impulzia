'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { IncentiveCard } from './incentive-card'
import type { IncentiveWithBusiness } from '../interfaces'

interface SavedIncentivesListProps {
  incentives: IncentiveWithBusiness[]
  onUnsave: (id: string) => void
  onRedeem?: (id: string) => void
}

export function SavedIncentivesList({
  incentives,
  onUnsave,
  onRedeem,
}: SavedIncentivesListProps) {
  if (incentives.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark size={40} className="mx-auto text-muted mb-3 opacity-40" />
        <p className="text-white font-medium">No tienes incentivos guardados</p>
        <p className="text-muted text-sm mt-1">Guarda cupones y ofertas para acceder fácilmente</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {incentives.map((incentive) => (
        <IncentiveCard
          key={incentive.id}
          incentive={incentive}
          isSaved
          onSave={onUnsave}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  )
}
