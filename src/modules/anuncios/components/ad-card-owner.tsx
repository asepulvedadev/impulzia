'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Eye,
  MousePointerClick,
  BarChart2,
  MoreVertical,
  Edit,
  Play,
  Pause,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import type { AdWithStats } from '../interfaces'
import {
  publishAdAction,
  pauseAdAction,
  resumeAdAction,
  deleteAdAction,
} from '../actions/ad.actions'

interface AdCardOwnerProps {
  ad: AdWithStats
  onEdit?: (id: string) => void
}

const STATUS_CONFIG = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  pending_review: { label: 'En revisión', variant: 'warning' as const },
  active: { label: 'Activo', variant: 'success' as const },
  paused: { label: 'Pausado', variant: 'warning' as const },
  expired: { label: 'Expirado', variant: 'error' as const },
  rejected: { label: 'Rechazado', variant: 'error' as const },
}

const TYPE_LABELS = {
  banner: 'Banner',
  featured: 'Destacado',
  promotion: 'Promoción',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AdCardOwner({ ad, onEdit }: AdCardOwnerProps) {
  const [loading, setLoading] = React.useState(false)
  const statusConfig = STATUS_CONFIG[ad.status as keyof typeof STATUS_CONFIG]

  async function handlePublish() {
    setLoading(true)
    await publishAdAction(ad.id)
    setLoading(false)
  }

  async function handlePause() {
    setLoading(true)
    await pauseAdAction(ad.id)
    setLoading(false)
  }

  async function handleResume() {
    setLoading(true)
    await resumeAdAction(ad.id)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este anuncio? Esta acción no se puede deshacer.')) return
    setLoading(true)
    await deleteAdAction(ad.id)
    setLoading(false)
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl border border-slate-800 bg-card transition-all hover:border-slate-700 hover:shadow-lg',
        loading && 'opacity-60 pointer-events-none',
      )}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
        {ad.image_url ? (
          <Image
            src={ad.image_url}
            alt={ad.title}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary-800 to-brand-primary-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{ad.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusConfig.variant} className="text-[10px] py-0">
                {statusConfig.label}
              </Badge>
              <span className="text-[11px] text-muted">{TYPE_LABELS[ad.type as keyof typeof TYPE_LABELS]}</span>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex-shrink-0 p-1 rounded text-muted hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Acciones del anuncio"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[160px] bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl"
                sideOffset={4}
                align="end"
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg cursor-pointer hover:bg-slate-800 outline-none"
                  onSelect={() => onEdit?.(ad.id)}
                >
                  <Edit size={14} />
                  Editar
                </DropdownMenu.Item>

                {ad.status === 'draft' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-success-400 rounded-lg cursor-pointer hover:bg-slate-800 outline-none"
                    onSelect={handlePublish}
                  >
                    <Play size={14} />
                    Publicar
                  </DropdownMenu.Item>
                )}

                {ad.status === 'active' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-warning-400 rounded-lg cursor-pointer hover:bg-slate-800 outline-none"
                    onSelect={handlePause}
                  >
                    <Pause size={14} />
                    Pausar
                  </DropdownMenu.Item>
                )}

                {ad.status === 'paused' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-brand-primary-400 rounded-lg cursor-pointer hover:bg-slate-800 outline-none"
                    onSelect={handleResume}
                  >
                    <RotateCcw size={14} />
                    Reactivar
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Separator className="my-1 border-t border-slate-700" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-error-400 rounded-lg cursor-pointer hover:bg-slate-800 outline-none"
                  onSelect={handleDelete}
                >
                  <Trash2 size={14} />
                  Eliminar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Eye size={12} />
            {ad.stats?.total_impressions ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <MousePointerClick size={12} />
            {ad.stats?.total_clicks ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <BarChart2 size={12} />
            {ad.stats?.ctr_percentage ?? 0}%
          </span>
        </div>

        {/* Dates */}
        <p className="text-[11px] text-muted mt-1">
          {formatDate(ad.schedule_start)} → {formatDate(ad.schedule_end)}
        </p>
      </div>
    </div>
  )
}
