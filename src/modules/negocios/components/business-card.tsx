import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { BusinessCard as BusinessCardType } from '../interfaces'

interface BusinessCardProps {
  business: BusinessCardType
  className?: string
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  const initial = business.name.charAt(0).toUpperCase()

  return (
    <Link
      href={`/negocio/${business.slug}`}
      className={cn(
        'group block rounded-2xl border border-slate-800 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-none',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-4 p-4">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 text-xl font-bold text-white">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">{business.name}</h3>
            {business.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-success-500" />
            )}
          </div>
          {business.business_categories && (
            <Badge variant="secondary" className="mt-1">
              {business.business_categories.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {business.short_description && (
        <p className="line-clamp-2 px-4 pb-2 text-sm text-muted">{business.short_description}</p>
      )}

      {/* Location */}
      <div className="border-t border-slate-800 px-4 py-3">
        <p className="text-xs text-muted">
          {[business.neighborhood, business.city].filter(Boolean).join(', ') || 'Sin ubicación'}
        </p>
      </div>
    </Link>
  )
}
