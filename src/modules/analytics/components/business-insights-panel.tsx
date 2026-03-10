import {
  Eye, MessageCircle, MapPin, TrendingUp, TrendingDown,
  Minus, Users, Clock, BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { BusinessInsightsData } from '../actions/insights.actions'

interface BusinessInsightsPanelProps {
  data: BusinessInsightsData
}

function StatCard({
  label, value, icon: Icon, trend, sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: number | null
  sub?: string
}) {
  const hasTrend = trend !== null && trend !== undefined
  const positive = hasTrend && trend! > 0
  const negative = hasTrend && trend! < 0

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-lg bg-brand-primary-900/20 p-2.5">
            <Icon className="h-5 w-5 text-brand-primary-400" />
          </div>
          {hasTrend && (
            <span className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              positive && 'bg-brand-success-900/30 text-brand-success-400',
              negative && 'bg-red-900/30 text-red-400',
              !positive && !negative && 'bg-slate-800 text-slate-400',
            )}>
              {positive ? <TrendingUp className="h-3 w-3" /> :
               negative ? <TrendingDown className="h-3 w-3" /> :
               <Minus className="h-3 w-3" />}
              {positive ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold text-white">{value}</p>
        <p className="mt-0.5 text-xs text-muted">{label}</p>
        {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function PeakHoursChart({ hours }: { hours: { hour_of_day: number; event_count: number }[] }) {
  if (hours.length === 0) return null

  const max = Math.max(...hours.map((h) => h.event_count), 1)
  const allHours = Array.from({ length: 24 }, (_, i) => {
    const found = hours.find((h) => h.hour_of_day === i)
    return { hour: i, count: found?.event_count ?? 0 }
  })

  const peakHour = hours.reduce((a, b) => a.event_count > b.event_count ? a : b, hours[0])
  const peakLabel = peakHour
    ? `${peakHour.hour_of_day}:00–${peakHour.hour_of_day + 1}:00`
    : null

  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-accent-900/20 p-2">
              <Clock className="h-4 w-4 text-brand-accent-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Horarios pico</h3>
              <p className="text-xs text-muted">Actividad por hora del día (30 días)</p>
            </div>
          </div>
          {peakLabel && (
            <span className="rounded-full bg-brand-accent-900/30 px-2.5 py-1 text-[11px] font-semibold text-brand-accent-400">
              Pico: {peakLabel}
            </span>
          )}
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-0.5 h-16">
          {allHours.map(({ hour, count }) => {
            const pct = max > 0 ? (count / max) * 100 : 0
            const isPeak = count === max && count > 0
            return (
              <div key={hour} className="group relative flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'w-full rounded-t transition-all',
                    isPeak
                      ? 'bg-brand-accent-500'
                      : count > 0
                        ? 'bg-brand-primary-700 group-hover:bg-brand-primary-500'
                        : 'bg-slate-800',
                  )}
                  style={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                />
                {/* Tooltip on hover */}
                {count > 0 && (
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-white group-hover:block z-10">
                    {hour}h · {count}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hour labels: 0, 6, 12, 18 */}
        <div className="mt-1 flex justify-between text-[10px] text-slate-600">
          {[0, 6, 12, 18, 23].map((h) => (
            <span key={h}>{h}h</span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NeighborhoodsCard({
  neighborhoods,
}: {
  neighborhoods: { neighborhood: string; event_count: number }[]
}) {
  if (neighborhoods.length === 0) return null

  const total = neighborhoods.reduce((s, n) => s + n.event_count, 0)

  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-brand-success-900/20 p-2">
            <MapPin className="h-4 w-4 text-brand-success-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Barrios que te visitan</h3>
            <p className="text-xs text-muted">Últimos 30 días</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {neighborhoods.map(({ neighborhood, event_count }) => {
            const pct = total > 0 ? Math.round((event_count / total) * 100) : 0
            return (
              <div key={neighborhood}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{neighborhood}</span>
                  <span className="text-muted">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-success-600 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryComparisonCard({
  comparison,
}: {
  comparison: BusinessInsightsData['comparison']
}) {
  if (!comparison) return null

  const { business_views_7d, category_avg_views_7d, percentile } = comparison
  const aboveAvg = business_views_7d >= category_avg_views_7d
  const diffPct = category_avg_views_7d > 0
    ? Math.round(Math.abs(business_views_7d - category_avg_views_7d) / category_avg_views_7d * 100)
    : 0

  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-brand-primary-900/20 p-2">
            <BarChart3 className="h-4 w-4 text-brand-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Vs. tu categoría</h3>
            <p className="text-xs text-muted">Comparativa de vistas esta semana</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{business_views_7d}</p>
            <p className="text-xs text-muted">Tu negocio</p>
          </div>
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
            aboveAvg ? 'bg-brand-success-900/30 text-brand-success-400' : 'bg-red-900/30 text-red-400',
          )}>
            {aboveAvg ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {aboveAvg ? '+' : '-'}{diffPct}% vs promedio
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>
            Promedio de tu categoría: <strong className="text-slate-300">{category_avg_views_7d} vistas</strong>
          </span>
        </div>

        {/* Percentile bar */}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>Percentil en tu categoría</span>
            <span className="font-semibold text-white">{percentile}°</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percentile >= 75 ? 'bg-brand-success-500' :
                percentile >= 50 ? 'bg-brand-primary-500' :
                percentile >= 25 ? 'bg-brand-accent-500' : 'bg-red-500',
              )}
              style={{ width: `${percentile}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SmartTips({ data }: { data: BusinessInsightsData }) {
  const tips: string[] = []

  const { stats, comparison, peak_hours } = data

  if (stats.views_7d === 0) {
    tips.push('Tu perfil aún no tiene visitas. Completa tu información y agrega fotos para atraer clientes.')
  } else if (stats.growth_pct !== null && stats.growth_pct < -20) {
    tips.push('Tus visitas bajaron esta semana. Considera publicar un anuncio o crear un incentivo.')
  }

  if (stats.whatsapp_clicks_7d === 0 && stats.views_7d > 5) {
    tips.push('Tienes visitas pero nadie hace clic en WhatsApp. Asegúrate de que tu número esté actualizado.')
  }

  if (comparison && comparison.percentile < 25) {
    tips.push('Estás por debajo del promedio de tu categoría. Usar el Centro IA puede mejorar tu visibilidad.')
  }

  const peakHour = peak_hours.length > 0
    ? peak_hours.reduce((a, b) => a.event_count > b.event_count ? a : b)
    : null

  if (peakHour) {
    tips.push(`Tu audiencia es más activa a las ${peakHour.hour_of_day}h. Es el mejor momento para publicar ofertas.`)
  }

  if (tips.length === 0) return null

  return (
    <Card className="border-brand-accent-800/40 bg-brand-accent-900/5">
      <CardContent className="py-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">💡</span>
          <h3 className="text-sm font-semibold text-white">Recomendaciones</h3>
        </div>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted">
              <span className="mt-0.5 text-brand-accent-500 shrink-0">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function BusinessInsightsPanel({ data }: BusinessInsightsPanelProps) {
  const { stats } = data

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-white">Rendimiento de tu negocio</h2>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Vistas hoy"
          value={stats.views_24h}
          icon={Eye}
          trend={stats.growth_pct}
          sub="vs. ayer"
        />
        <StatCard
          label="Vistas esta semana"
          value={stats.views_7d}
          icon={Eye}
        />
        <StatCard
          label="Clicks a WhatsApp"
          value={stats.whatsapp_clicks_7d}
          icon={MessageCircle}
          sub="Últimos 7 días"
        />
        <StatCard
          label="Clicks a Mapa"
          value={stats.maps_clicks_7d}
          icon={MapPin}
          sub="Últimos 7 días"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PeakHoursChart hours={data.peak_hours} />
        <NeighborhoodsCard neighborhoods={data.top_neighborhoods} />
      </div>

      {/* Category comparison + tips */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryComparisonCard comparison={data.comparison} />
        <SmartTips data={data} />
      </div>
    </div>
  )
}
