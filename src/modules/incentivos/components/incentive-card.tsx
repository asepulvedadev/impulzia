'use client'

import * as React from 'react'
import { Tag, Percent, Gift, Bookmark, BookmarkCheck, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { IncentiveWithBusiness } from '../interfaces'

const TYPE_CONFIG = {
  coupon: {
    label: 'Cupón',
    icon: Tag,
    color: 'text-brand-primary-400',
    bg: 'bg-brand-primary-900/30',
  },
  combo: {
    label: 'Combo',
    icon: Percent,
    color: 'text-brand-accent-400',
    bg: 'bg-brand-accent-900/30',
  },
  reward: {
    label: 'Premio',
    icon: Gift,
    color: 'text-brand-success-400',
    bg: 'bg-brand-success-900/30',
  },
}

function formatDiscount(discountType: string | null, discountValue: number | null): string | null {
  if (!discountType) return null
  if (discountType === 'percentage' && discountValue) return `-${discountValue}%`
  if (discountType === 'fixed_amount' && discountValue)
    return `-$${discountValue.toLocaleString('es-CO')}`
  if (discountType === 'free_item') return 'Ítem gratis'
  return null
}

function timeUntilExpiry(endDate: string | null): string | null {
  if (!endDate) return null
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff < 0) return 'Expirado'
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Expira hoy'
  if (days === 1) return 'Expira mañana'
  if (days <= 7) return `Expira en ${days} días`
  return null
}

interface IncentiveCardProps {
  incentive: IncentiveWithBusiness
  isSaved?: boolean
  onSave?: (id: string) => void
  onRedeem?: (id: string) => void
  className?: string
  compact?: boolean
}

export function IncentiveCard({
  incentive,
  isSaved = false,
  onSave,
  onRedeem,
  className,
  compact = false,
}: IncentiveCardProps) {
  const typeConfig = TYPE_CONFIG[incentive.type as keyof typeof TYPE_CONFIG]
  const TypeIcon = typeConfig.icon
  const discountLabel = formatDiscount(incentive.discount_type, incentive.discount_value)
  const expiryLabel = timeUntilExpiry(incentive.end_date)
  const isExpiringSoon =
    (expiryLabel && expiryLabel.includes('hoy')) || expiryLabel?.includes('mañana')
  const usagePercent =
    incentive.max_uses && incentive.current_uses
      ? Math.round((incentive.current_uses / incentive.max_uses) * 100)
      : null

  return (
    <Card
      className={cn(
        'overflow-hidden flex flex-col group transition-all hover:ring-1 hover:ring-brand-primary-500/50',
        className,
      )}
    >
      {/* Image or gradient header */}
      {incentive.image_url ? (
        <div className="relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={incentive.image_url}
            alt={incentive.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {discountLabel && (
            <span className="absolute top-2 left-2 bg-brand-accent-500 text-white text-sm font-bold px-2 py-0.5 rounded-md">
              {discountLabel}
            </span>
          )}
          {onSave && (
            <button
              onClick={() => onSave(incentive.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
              aria-label={isSaved ? 'Quitar guardado' : 'Guardar incentivo'}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      ) : (
        <div className={cn('h-20 flex items-center justify-center relative', typeConfig.bg)}>
          <TypeIcon size={32} className={typeConfig.color} />
          {discountLabel && (
            <span className="absolute top-2 left-2 bg-brand-accent-500 text-white text-sm font-bold px-2 py-0.5 rounded-md">
              {discountLabel}
            </span>
          )}
          {onSave && (
            <button
              onClick={() => onSave(incentive.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              aria-label={isSaved ? 'Quitar guardado' : 'Guardar incentivo'}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] gap-0.5">
            <TypeIcon size={10} />
            {typeConfig.label}
          </Badge>
          {isExpiringSoon && (
            <Badge variant="warning" className="text-[10px] gap-0.5">
              <Clock size={10} />
              {expiryLabel}
            </Badge>
          )}
        </div>

        <p className="font-semibold text-white text-sm leading-tight line-clamp-2">
          {incentive.title}
        </p>

        {!compact && incentive.description && (
          <p className="text-xs text-muted line-clamp-2">{incentive.description}</p>
        )}

        {incentive.business && (
          <p className="text-xs text-muted truncate">{incentive.business.name}</p>
        )}

        {/* Usage bar */}
        {usagePercent !== null && (
          <div className="mt-auto">
            <div className="flex justify-between text-[10px] text-muted mb-1">
              <span className="flex items-center gap-0.5">
                <Users size={10} />
                {incentive.current_uses} usados
              </span>
              <span>{usagePercent}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  usagePercent >= 90 ? 'bg-brand-error-500' : 'bg-brand-primary-500',
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {onRedeem && (
          <Button size="sm" className="w-full mt-2" onClick={() => onRedeem(incentive.id)}>
            Canjear ahora
          </Button>
        )}
      </div>
    </Card>
  )
}
