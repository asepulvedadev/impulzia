import { createClient } from '@/lib/supabase/server'
import { AnalyticsService } from '../services/analytics.service'
import { TrackingService } from '../services/tracking.service'
import {
  Search, TrendingUp, MapPin, AlertCircle, Eye, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export async function AdminAnalyticsPanel() {
  const supabase = await createClient()
  const analyticsService = new AnalyticsService(supabase)
  const trackingService = new TrackingService(supabase)

  const [
    topSearches,
    zeroResults,
    heatmap,
    topSearchesRaw,
  ] = await Promise.all([
    analyticsService.getTopSearches(10),
    analyticsService.getZeroResultSearches(8),
    analyticsService.getNeighborhoodHeatmap(10),
    trackingService.getTopSearches(5),
  ])

  // Total eventos 7 días
  const { count: totalEvents7d } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: totalSearches7d } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'search_query')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: totalBusinessViews7d } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'business_view')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: totalWhatsapp7d } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'whatsapp_click')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const maxSearch = Math.max(...(topSearchesRaw.map((s) => s.count)), 1)
  const maxNeighborhood = Math.max(...(heatmap.map((n) => n.unique_sessions)), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-brand-primary-400" />
        <h2 className="font-heading text-base font-bold text-white">Analytics de la plataforma</h2>
        <span className="rounded-full bg-brand-primary-900/30 px-2 py-0.5 text-[10px] font-semibold text-brand-primary-400">
          Últimos 7 días
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Eventos totales', value: totalEvents7d ?? 0, icon: Eye, color: 'text-brand-primary-400', bg: 'bg-brand-primary-900/20' },
          { label: 'Búsquedas', value: totalSearches7d ?? 0, icon: Search, color: 'text-brand-accent-400', bg: 'bg-brand-accent-900/20' },
          { label: 'Vistas de negocio', value: totalBusinessViews7d ?? 0, icon: TrendingUp, color: 'text-brand-success-400', bg: 'bg-brand-success-900/20' },
          { label: 'Clicks WhatsApp', value: totalWhatsapp7d ?? 0, icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted">{label}</p>
              <div className={cn('rounded-lg p-1.5', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value.toLocaleString('es-CO')}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top búsquedas */}
        {topSearchesRaw.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-brand-primary-900/20 p-1.5">
                <Search className="h-4 w-4 text-brand-primary-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Top búsquedas</h3>
            </div>
            <div className="space-y-2.5">
              {topSearchesRaw.map(({ query, count }, i) => {
                const pct = Math.round((count / maxSearch) * 100)
                return (
                  <div key={query}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-right text-slate-600 font-mono">{i + 1}</span>
                        <span className="font-medium text-slate-300 capitalize">{query}</span>
                      </div>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-primary-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Búsquedas sin resultados — oportunidades */}
        {zeroResults.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-red-900/20 p-1.5">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Sin resultados</h3>
                <p className="text-[11px] text-muted">Oportunidades de mercado</p>
              </div>
            </div>
            <div className="space-y-2">
              {zeroResults.map(({ query, count }) => (
                <div
                  key={query}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
                >
                  <span className="text-sm text-slate-300 capitalize">{query}</span>
                  <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                    {count}× sin resultado
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-600">
              💡 Estas búsquedas tienen demanda pero ningún negocio las cubre. Úsalas para atraer nuevos registros.
            </p>
          </div>
        )}

        {/* Heatmap de barrios */}
        {heatmap.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-brand-success-900/20 p-1.5">
                <MapPin className="h-4 w-4 text-brand-success-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Actividad por barrio</h3>
              <span className="text-[11px] text-muted">(sesiones únicas)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {heatmap.map(({ neighborhood, unique_sessions, searches, whatsapp_clicks }) => {
                const intensity = unique_sessions / maxNeighborhood
                return (
                  <div
                    key={neighborhood}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                    style={{
                      borderColor: `rgba(37, 99, 235, ${0.15 + intensity * 0.6})`,
                    }}
                  >
                    <p className="truncate text-xs font-semibold text-white">{neighborhood}</p>
                    <p className="mt-1 text-lg font-bold text-brand-primary-400">{unique_sessions}</p>
                    <div className="mt-1 flex gap-2 text-[10px] text-muted">
                      <span>🔍 {searches}</span>
                      <span>💬 {whatsapp_clicks}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No hay datos aún */}
        {topSearchesRaw.length === 0 && zeroResults.length === 0 && heatmap.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center lg:col-span-2">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">Aún no hay eventos registrados</p>
            <p className="mt-1 text-xs text-slate-600">
              Los datos aparecerán aquí a medida que los usuarios interactúen con la plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
