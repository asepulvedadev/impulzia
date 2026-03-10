'use server'

import { createClient } from '@/lib/supabase/server'
import { AnalyticsService } from '../services/analytics.service'

export interface BusinessInsightsData {
  stats: {
    views_24h: number
    views_7d: number
    views_30d: number
    whatsapp_clicks_7d: number
    maps_clicks_7d: number
    growth_pct: number | null
  }
  comparison: {
    business_views_7d: number
    category_avg_views_7d: number
    percentile: number
  } | null
  peak_hours: { hour_of_day: number; event_count: number }[]
  top_neighborhoods: { neighborhood: string; event_count: number }[]
}

export async function getBusinessInsightsAction(
  businessId: string,
): Promise<BusinessInsightsData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = new AnalyticsService(supabase)

  const [statsResult, comparison, peakHours, topNeighborhoods] = await Promise.all([
    service.getBusinessStats(businessId),
    service.compareWithCategory(businessId),
    supabase.rpc('get_business_peak_hours', { p_business_id: businessId }),
    supabase.rpc('get_business_top_neighborhoods', { p_business_id: businessId, p_limit: 5 }),
  ])

  if (!statsResult) {
    return {
      stats: {
        views_24h: 0, views_7d: 0, views_30d: 0,
        whatsapp_clicks_7d: 0, maps_clicks_7d: 0, growth_pct: null,
      },
      comparison: null,
      peak_hours: [],
      top_neighborhoods: [],
    }
  }

  return {
    stats: {
      views_24h: statsResult.views_24h,
      views_7d: statsResult.views_7d,
      views_30d: statsResult.views_30d,
      whatsapp_clicks_7d: statsResult.whatsapp_clicks_7d,
      maps_clicks_7d: statsResult.maps_clicks_7d,
      growth_pct: statsResult.growth_pct,
    },
    comparison: comparison ?? null,
    peak_hours: (peakHours.data ?? []) as { hour_of_day: number; event_count: number }[],
    top_neighborhoods: (topNeighborhoods.data ?? []) as { neighborhood: string; event_count: number }[],
  }
}
