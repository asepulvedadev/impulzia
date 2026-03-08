'use client'

import * as React from 'react'
import { Tag, Percent, Gift, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type IncentiveType = 'coupon' | 'combo' | 'reward'

interface IncentiveFiltersProps {
  activeType?: IncentiveType
  onTypeChange: (type: IncentiveType | undefined) => void
  className?: string
}

const TYPES = [
  { value: 'coupon' as const, label: 'Cupones', icon: Tag },
  { value: 'combo' as const, label: 'Combos', icon: Percent },
  { value: 'reward' as const, label: 'Premios', icon: Gift },
]

export function IncentiveFilters({ activeType, onTypeChange, className }: IncentiveFiltersProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide', className)}>
      {TYPES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onTypeChange(activeType === value ? undefined : value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            activeType === value
              ? 'bg-brand-primary-600 text-white ring-1 ring-brand-primary-500'
              : 'bg-slate-800 text-muted hover:bg-slate-700 hover:text-white',
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
      {activeType && (
        <button
          onClick={() => onTypeChange(undefined)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-white transition-colors"
        >
          <X size={12} />
          Limpiar
        </button>
      )}
    </div>
  )
}
