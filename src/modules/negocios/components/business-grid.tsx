import { Store } from 'lucide-react'
import { BusinessCard } from './business-card'
import { BusinessCardSkeleton } from './business-card-skeleton'
import type { BusinessCard as BusinessCardType } from '../interfaces'

interface BusinessGridProps {
  businesses: BusinessCardType[]
  isLoading?: boolean
  skeletonCount?: number
}

export function BusinessGrid({
  businesses,
  isLoading = false,
  skeletonCount = 6,
}: BusinessGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <BusinessCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-slate-800 p-4">
          <Store className="h-10 w-10 text-muted" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">No se encontraron negocios</h3>
        <p className="mt-1 text-sm text-muted">Intenta con otros filtros o términos de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  )
}
