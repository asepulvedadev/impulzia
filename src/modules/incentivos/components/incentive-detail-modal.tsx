'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Tag, Percent, Gift, Store, MapPin, Clock, Users, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { IncentiveWithBusiness } from '../interfaces'

const TYPE_CONFIG = {
  coupon: { label: 'Cupón', icon: Tag, color: 'text-brand-primary-400' },
  combo: { label: 'Combo', icon: Percent, color: 'text-brand-accent-400' },
  reward: { label: 'Premio', icon: Gift, color: 'text-brand-success-400' },
}

function formatDiscount(type: string | null, value: number | null): string | null {
  if (!type) return null
  if (type === 'percentage' && value) return `${value}% de descuento`
  if (type === 'fixed_amount' && value) return `$${value.toLocaleString('es-CO')} de descuento`
  if (type === 'free_item') return 'Ítem gratis incluido'
  return null
}

interface IncentiveDetailModalProps {
  incentive: IncentiveWithBusiness | null
  open: boolean
  onClose: () => void
  onRedeem?: (id: string) => void
  isRedeeming?: boolean
}

export function IncentiveDetailModal({
  incentive,
  open,
  onClose,
  onRedeem,
  isRedeeming = false,
}: IncentiveDetailModalProps) {
  if (!incentive) return null

  const typeConfig = TYPE_CONFIG[incentive.type as keyof typeof TYPE_CONFIG]
  const TypeIcon = typeConfig.icon
  const discountLabel = formatDiscount(incentive.discount_type, incentive.discount_value)

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in" />
        <Dialog.Content className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full z-50 bg-card border border-card-border rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 outline-none">
          {/* Close */}
          <Dialog.Close className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-muted transition-colors z-10">
            <X size={16} />
          </Dialog.Close>

          {/* Image or header */}
          {incentive.image_url ? (
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={incentive.image_url}
                alt={incentive.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
          ) : (
            <div className="h-20 rounded-t-2xl flex items-center justify-center bg-slate-800">
              <TypeIcon size={40} className={typeConfig.color} />
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Type + discount */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <TypeIcon size={11} />
                {typeConfig.label}
              </Badge>
              {discountLabel && (
                <Badge variant="accent" className="font-bold">
                  {discountLabel}
                </Badge>
              )}
            </div>

            <Dialog.Title className="text-lg font-bold text-white">{incentive.title}</Dialog.Title>

            {incentive.description && <p className="text-muted text-sm">{incentive.description}</p>}

            {/* Business info */}
            {incentive.business && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Store size={14} />
                <span className="font-medium text-white">{incentive.business.name}</span>
                {incentive.business.neighborhood && (
                  <>
                    <span>·</span>
                    <MapPin size={12} />
                    <span>{incentive.business.neighborhood}</span>
                  </>
                )}
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {incentive.end_date && (
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock size={13} />
                  <span>
                    Vence{' '}
                    {new Date(incentive.end_date).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              )}
              {incentive.max_uses && (
                <div className="flex items-center gap-1.5 text-muted">
                  <Users size={13} />
                  <span>{incentive.max_uses - incentive.current_uses} disponibles</span>
                </div>
              )}
              {incentive.min_purchase && (
                <div className="flex items-center gap-1.5 text-muted col-span-2">
                  <Info size={13} />
                  <span>Compra mínima: ${incentive.min_purchase.toLocaleString('es-CO')}</span>
                </div>
              )}
            </div>

            {/* Terms */}
            {incentive.terms && (
              <details className="text-xs text-muted">
                <summary className="cursor-pointer hover:text-white transition-colors">
                  Ver términos y condiciones
                </summary>
                <p className="mt-2 pl-2 border-l border-card-border">{incentive.terms}</p>
              </details>
            )}

            {/* CTA */}
            {onRedeem && (
              <Button
                className="w-full"
                onClick={() => onRedeem(incentive.id)}
                disabled={isRedeeming}
              >
                {isRedeeming ? 'Canjeando...' : 'Canjear incentivo'}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
