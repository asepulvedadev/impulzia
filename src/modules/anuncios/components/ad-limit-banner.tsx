'use client'

import * as React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AD_PLAN_LIMITS } from '../interfaces'

interface AdLimitBannerProps {
  currentCount: number
  tier: string
}

export function AdLimitBanner({ currentCount, tier }: AdLimitBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const limit = AD_PLAN_LIMITS[tier] ?? 1

  if (dismissed || limit === Infinity || currentCount < limit) return null

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-warning-900/20 border border-brand-warning-700/40">
      <AlertTriangle size={18} className="text-brand-warning-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">
          Has alcanzado el límite de tu plan gratuito ({currentCount}/{limit} anuncios activos)
        </p>
        <p className="text-xs text-muted mt-0.5">
          Mejora tu plan para crear más anuncios con mejor posicionamiento
        </p>
        <Button variant="accent" size="sm" className="mt-2">
          Mejora tu plan
        </Button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-muted hover:text-white transition-colors"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  )
}
