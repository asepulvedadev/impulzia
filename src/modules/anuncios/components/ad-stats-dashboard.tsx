'use client'

import * as React from 'react'
import { Eye, MousePointerClick, BarChart2, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Ad, AdDetailedStats } from '../interfaces'

const STATUS_CONFIG = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  pending_review: { label: 'En revisión', variant: 'warning' as const },
  active: { label: 'Activo', variant: 'success' as const },
  paused: { label: 'Pausado', variant: 'warning' as const },
  expired: { label: 'Expirado', variant: 'error' as const },
  rejected: { label: 'Rechazado', variant: 'error' as const },
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  sublabel?: string
}

function MetricCard({ icon, label, value, sublabel }: MetricCardProps) {
  return (
    <Card className="p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-brand-primary-900/30 text-brand-primary-400">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString('es-CO')}</p>
        <p className="text-sm text-muted">{label}</p>
        {sublabel && <p className="text-xs text-brand-primary-400 mt-0.5">{sublabel}</p>}
      </div>
    </Card>
  )
}

interface SparklineProps {
  data: number[]
  color?: string
}

function Sparkline({ data, color = '#2563EB' }: SparklineProps) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const width = 200
  const height = 40
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - (v / max) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface AdStatsDashboardProps {
  ad: Ad
  stats: AdDetailedStats | null
}

export function AdStatsDashboard({ ad, stats }: AdStatsDashboardProps) {
  const statusConfig = STATUS_CONFIG[ad.status]

  if (!stats || stats.total_impressions === 0) {
    return (
      <div className="text-center py-12">
        <BarChart2 size={40} className="mx-auto text-muted mb-3 opacity-50" />
        <p className="text-white font-medium">Tu anuncio aún no tiene actividad</p>
        <p className="text-muted text-sm mt-1">
          ¡Compártelo para empezar a recibir impresiones y clics!
        </p>
      </div>
    )
  }

  // Mock 7-day sparkline data (in real app, fetch per-day data from DB)
  const mockImpressionsWeek = [
    Math.round(stats.impressions_last_7d * 0.1),
    Math.round(stats.impressions_last_7d * 0.12),
    Math.round(stats.impressions_last_7d * 0.14),
    Math.round(stats.impressions_last_7d * 0.13),
    Math.round(stats.impressions_last_7d * 0.18),
    Math.round(stats.impressions_last_7d * 0.15),
    Math.round(stats.impressions_last_7d * 0.18),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-white text-lg truncate flex-1">{ad.title}</h2>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<Eye size={18} />}
          label="Impresiones"
          value={stats.total_impressions}
          sublabel={`+${stats.impressions_last_24h} hoy`}
        />
        <MetricCard
          icon={<MousePointerClick size={18} />}
          label="Clics"
          value={stats.total_clicks}
          sublabel={`+${stats.clicks_last_24h} hoy`}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="CTR"
          value={Number(stats.ctr_percentage)}
          sublabel="tasa de clics"
        />
      </div>

      {/* 7-day chart */}
      <Card className="p-4">
        <p className="text-sm font-medium text-white mb-3">Impresiones — últimos 7 días</p>
        <Sparkline data={mockImpressionsWeek} color="#2563EB" />
        <div className="flex justify-between text-[10px] text-muted mt-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </Card>

      {/* Last 7 days summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted">Impresiones (7d)</p>
          <p className="text-xl font-bold text-white">{stats.impressions_last_7d}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted">Clics (7d)</p>
          <p className="text-xl font-bold text-white">{stats.clicks_last_7d}</p>
        </Card>
      </div>
    </div>
  )
}
