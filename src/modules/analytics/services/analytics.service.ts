import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { BusinessEventStats, NeighborhoodHeatmap, SearchAnalytics } from '../interfaces'

export class AnalyticsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /** Negocios trending (mayor velocity en las últimas 24h) */
  async getTrendingBusinesses(limit = 6): Promise<{ business_id: string; views_7d: number; velocity_ratio: number }[]> {
    const { data } = await this.supabase
      .from('business_stats' as 'businesses') // cast temporal hasta regenerar tipos
      .select('business_id, views_7d, velocity_ratio')
      .order('velocity_ratio', { ascending: false })
      .limit(limit)

    return (data as unknown as { business_id: string; views_7d: number; velocity_ratio: number }[]) ?? []
  }

  /** Stats de un negocio específico para el panel del dueño */
  async getBusinessStats(businessId: string): Promise<BusinessEventStats | null> {
    const { data } = await this.supabase
      .from('business_stats' as 'businesses')
      .select('*')
      .eq('business_id' as 'id', businessId)
      .maybeSingle()

    if (!data) return null

    const row = data as unknown as {
      business_id: string
      views_24h: number
      views_7d: number
      views_30d: number
      whatsapp_clicks_7d: number
      maps_clicks_7d: number
      velocity_ratio: number
    }

    return {
      business_id: row.business_id,
      views_24h: row.views_24h,
      views_7d: row.views_7d,
      views_30d: row.views_30d,
      whatsapp_clicks_7d: row.whatsapp_clicks_7d,
      maps_clicks_7d: row.maps_clicks_7d,
      growth_pct: row.velocity_ratio > 0 ? Math.round((row.velocity_ratio - 1) * 100) : null,
    }
  }

  /** Top búsquedas de los últimos 7 días */
  async getTopSearches(limit = 20): Promise<SearchAnalytics[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)

    const { data } = await this.supabase
      .from('search_analytics' as 'businesses')
      .select('*')
      .gte('day' as 'id', sevenDaysAgo)
      .order('search_count', { ascending: false })
      .limit(limit)

    return (data as unknown as SearchAnalytics[]) ?? []
  }

  /** Búsquedas sin resultados — oportunidades de mercado */
  async getZeroResultSearches(limit = 10): Promise<{ query: string; count: number }[]> {
    const { data } = await this.supabase
      .from('search_analytics' as 'businesses')
      .select('query, zero_results_count')
      .gt('zero_results_count' as 'id', 0)
      .order('zero_results_count', { ascending: false })
      .limit(limit)

    return (data as unknown as { query: string; zero_results_count: number }[]).map((r) => ({
      query: r.query,
      count: r.zero_results_count,
    }))
  }

  /** Heatmap de barrios */
  async getNeighborhoodHeatmap(limit = 15): Promise<NeighborhoodHeatmap[]> {
    const { data } = await this.supabase
      .from('neighborhood_heatmap' as 'businesses')
      .select('*')
      .order('unique_sessions', { ascending: false })
      .limit(limit)

    return (data as unknown as NeighborhoodHeatmap[]) ?? []
  }

  /** Comparar un negocio vs promedio de su categoría */
  async compareWithCategory(businessId: string): Promise<{
    business_views_7d: number
    category_avg_views_7d: number
    percentile: number
  } | null> {
    const { data: bizStats } = await this.supabase
      .from('business_stats' as 'businesses')
      .select('views_7d, category_slug')
      .eq('business_id' as 'id', businessId)
      .maybeSingle()

    if (!bizStats) return null

    const biz = bizStats as unknown as { views_7d: number; category_slug: string }

    const { data: categoryStats } = await this.supabase
      .from('business_stats' as 'businesses')
      .select('views_7d')
      .eq('category_slug' as 'id', biz.category_slug)

    if (!categoryStats || categoryStats.length === 0) return null

    const allViews = (categoryStats as unknown as { views_7d: number }[]).map((r) => r.views_7d)
    const avg = allViews.reduce((a, b) => a + b, 0) / allViews.length
    const below = allViews.filter((v) => v < biz.views_7d).length
    const percentile = Math.round((below / allViews.length) * 100)

    return {
      business_views_7d: biz.views_7d,
      category_avg_views_7d: Math.round(avg),
      percentile,
    }
  }
}
