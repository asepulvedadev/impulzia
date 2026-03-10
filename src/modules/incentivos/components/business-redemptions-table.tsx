'use client'

import * as React from 'react'
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { RedemptionWithDetails } from '../interfaces'

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    variant: 'warning' as const,
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmado',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'error' as const,
    icon: XCircle,
  },
  expired: {
    label: 'Expirado',
    variant: 'secondary' as const,
    icon: AlertCircle,
  },
}

interface BusinessRedemptionsTableProps {
  redemptions: RedemptionWithDetails[]
}

export function BusinessRedemptionsTable({ redemptions }: BusinessRedemptionsTableProps) {
  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white font-medium">Aún no hay canjes</p>
        <p className="text-muted text-sm mt-1">Los canjes de clientes aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {redemptions.map((r) => {
        const statusConfig = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
        const StatusIcon = statusConfig.icon

        return (
          <Card key={r.id} className="p-3 flex items-center gap-3">
            <StatusIcon
              size={16}
              className={
                r.status === 'confirmed'
                  ? 'text-brand-success-400'
                  : r.status === 'pending'
                    ? 'text-brand-warning-400'
                    : 'text-muted'
              }
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {r.incentive?.title ?? 'Incentivo eliminado'}
              </p>
              <p className="text-xs text-muted truncate">
                {r.user?.full_name ?? r.user?.email ?? 'Usuario desconocido'} ·{' '}
                {new Date(r.created_at).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={statusConfig.variant} className="text-[10px]">
                {statusConfig.label}
              </Badge>
              <span className="font-mono text-[10px] text-muted">{r.redemption_token}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function BusinessRedemptionsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-3 flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 bg-slate-800 rounded-full" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="h-2.5 bg-slate-800 rounded w-1/2" />
          </div>
          <div className="h-5 w-16 bg-slate-800 rounded-full" />
        </Card>
      ))}
    </div>
  )
}
