'use client'

import * as React from 'react'
import { Star, Stamp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { LoyaltyCard } from '../interfaces'

interface LoyaltyCardVisualProps {
  card: LoyaltyCard
  businessName: string
  className?: string
}

export function LoyaltyCardVisual({ card, businessName, className }: LoyaltyCardVisualProps) {
  const progress = card.total_stamps % card.stamps_required
  const currentCycle = progress === 0 && card.total_stamps > 0 ? card.stamps_required : progress
  const percent = Math.round((currentCycle / card.stamps_required) * 100)

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-5 bg-gradient-to-br from-brand-primary-900/50 to-slate-900',
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand-primary-600/10" />
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-brand-accent-500/10" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">Tarjeta de fidelidad</p>
            <p className="font-bold text-white">{businessName}</p>
          </div>
          {card.rewards_earned > 0 && (
            <div className="flex items-center gap-1 bg-brand-accent-500/20 text-brand-accent-400 text-xs font-medium px-2 py-1 rounded-full">
              <Star size={11} fill="currentColor" />
              {card.rewards_earned} {card.rewards_earned === 1 ? 'premio' : 'premios'}
            </div>
          )}
        </div>

        {/* Stamp grid */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(card.stamps_required, 5)}, 1fr)` }}
        >
          {Array.from({ length: card.stamps_required }).map((_, i) => {
            const isEarned = i < currentCycle
            return (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center transition-all',
                  isEarned
                    ? 'bg-brand-primary-600 text-white scale-100'
                    : 'bg-slate-800/60 text-slate-600',
                )}
              >
                <Stamp size={14} />
              </div>
            )
          })}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>
              {currentCycle} / {card.stamps_required} sellos
            </span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {currentCycle === 0 && card.total_stamps > 0 ? (
            <p className="text-xs text-brand-success-400 mt-1.5 font-medium">
              ¡Premio desbloqueado! Habla con el negocio para canjearlo.
            </p>
          ) : (
            <p className="text-xs text-muted mt-1.5">
              {card.stamps_required - currentCycle} sellos para tu próximo premio
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
