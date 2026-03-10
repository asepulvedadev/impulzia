'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  MoreVertical,
  Edit,
  PlayCircle,
  PauseCircle,
  Trash2,
  Eye,
  MousePointerClick,
  Tag,
  Percent,
  Gift,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { IncentiveWithStats } from '../interfaces'

const STATUS_CONFIG = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  active: { label: 'Activo', variant: 'success' as const },
  paused: { label: 'Pausado', variant: 'warning' as const },
  expired: { label: 'Expirado', variant: 'error' as const },
  depleted: { label: 'Agotado', variant: 'error' as const },
}

const TYPE_ICONS = { coupon: Tag, combo: Percent, reward: Gift }

interface IncentiveCardOwnerProps {
  incentive: IncentiveWithStats
  onEdit: (id: string) => void
  onPublish?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onDelete?: (id: string) => void
}

export function IncentiveCardOwner({
  incentive,
  onEdit,
  onPublish,
  onPause,
  onResume,
  onDelete,
}: IncentiveCardOwnerProps) {
  const statusConfig = STATUS_CONFIG[incentive.status as keyof typeof STATUS_CONFIG]
  const TypeIcon = TYPE_ICONS[incentive.type as keyof typeof TYPE_ICONS]

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-brand-primary-900/30 text-brand-primary-400 shrink-0">
          <TypeIcon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{incentive.title}</p>
          {incentive.description && (
            <p className="text-xs text-muted truncate mt-0.5">{incentive.description}</p>
          )}
        </div>

        {/* Actions dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 rounded-md hover:bg-slate-800 text-muted hover:text-white transition-colors">
              <MoreVertical size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] bg-card border border-card-border rounded-xl shadow-xl z-50 py-1"
              align="end"
            >
              <DropdownMenu.Item
                onClick={() => onEdit(incentive.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-slate-800 cursor-pointer outline-none"
              >
                <Edit size={14} />
                Editar
              </DropdownMenu.Item>

              {(incentive.status === 'draft' || incentive.status === 'paused') && onPublish && (
                <DropdownMenu.Item
                  onClick={() => onPublish(incentive.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-success-400 hover:bg-slate-800 cursor-pointer outline-none"
                >
                  <PlayCircle size={14} />
                  Publicar
                </DropdownMenu.Item>
              )}

              {incentive.status === 'active' && onPause && (
                <DropdownMenu.Item
                  onClick={() => onPause(incentive.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-warning-400 hover:bg-slate-800 cursor-pointer outline-none"
                >
                  <PauseCircle size={14} />
                  Pausar
                </DropdownMenu.Item>
              )}

              {incentive.status === 'paused' && onResume && (
                <DropdownMenu.Item
                  onClick={() => onResume(incentive.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-primary-400 hover:bg-slate-800 cursor-pointer outline-none"
                >
                  <PlayCircle size={14} />
                  Reactivar
                </DropdownMenu.Item>
              )}

              {incentive.status !== 'active' && onDelete && (
                <>
                  <DropdownMenu.Separator className="h-px bg-card-border my-1" />
                  <DropdownMenu.Item
                    onClick={() => onDelete(incentive.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-error-400 hover:bg-slate-800 cursor-pointer outline-none"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={statusConfig.variant} className="text-[10px]">
          {statusConfig.label}
        </Badge>
        {incentive.end_date && (
          <span className="text-[10px] text-muted">
            Vence {new Date(incentive.end_date).toLocaleDateString('es-CO')}
          </span>
        )}
        {incentive.max_uses && (
          <span className="text-[10px] text-muted">
            {incentive.current_uses}/{incentive.max_uses} usos
          </span>
        )}
      </div>

      {/* Stats row */}
      {incentive.stats && (
        <div className="flex items-center gap-4 text-xs text-muted border-t border-card-border pt-2">
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {incentive.stats.total_redemptions} canjes
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick size={11} />
            {incentive.stats.confirmed_redemptions} confirmados
          </span>
          {(incentive.stats.total_saved ?? 0) > 0 && (
            <span className="text-brand-primary-400">{incentive.stats.total_saved} guardados</span>
          )}
        </div>
      )}
    </Card>
  )
}
