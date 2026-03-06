import type { Database } from '@/lib/supabase/database.types'

// Database row types
type AdRow = Database['public']['Tables']['ads']['Row']
type AdImpressionRow = Database['public']['Tables']['ad_impressions']['Row']
type AdClickRow = Database['public']['Tables']['ad_clicks']['Row']
type AdStatsRow = Database['public']['Views']['ad_stats']['Row']

// Core types
export type Ad = AdRow
export type AdImpression = AdImpressionRow
export type AdClick = AdClickRow
export type AdStats = AdStatsRow

// Ad with extended stats
export interface AdWithStats extends Ad {
  stats: AdStats | null
}

// Plan limits
export const AD_PLAN_LIMITS: Record<string, number> = {
  free: 1,
  basic: 5,
  pro: 15,
  premium: Infinity,
}

// Form input types
export interface CreateAdInput {
  title: string
  description?: string
  type: 'banner' | 'featured' | 'promotion'
  image_url?: string
  cta_text?: string
  cta_url?: string
  target_categories?: string[]
  target_neighborhoods?: string[]
  schedule_start?: string
  schedule_end?: string
  daily_start_hour?: number
  daily_end_hour?: number
}

export interface UpdateAdInput {
  title?: string
  description?: string
  image_url?: string
  cta_text?: string
  cta_url?: string
  target_categories?: string[]
  target_neighborhoods?: string[]
  schedule_start?: string
  schedule_end?: string
  daily_start_hour?: number
  daily_end_hour?: number
}

export interface AdFiltersInput {
  type?: 'banner' | 'featured' | 'promotion'
  category_id?: string
  neighborhood?: string
  city?: string
  limit?: number
}

// Detailed stats (with time ranges)
export interface AdDetailedStats {
  ad_id: string
  total_impressions: number
  total_clicks: number
  ctr_percentage: number
  impressions_last_7d: number
  clicks_last_7d: number
  impressions_last_24h: number
  clicks_last_24h: number
  impressions_last_30d: number
  clicks_last_30d: number
}

// Service result wrapper (shared)
export interface ServiceResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Tracking context
export type TrackingContext = 'feed' | 'explorer' | 'business_profile' | 'search'
