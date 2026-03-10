import type { Database } from '@/lib/supabase/database.types'

export type UserEvent = Database['public']['Tables']['user_events']['Row']
export type UserEventInsert = Database['public']['Tables']['user_events']['Insert']
export type UserPreference = Database['public']['Tables']['user_preferences']['Row']

export type EventType = UserEvent['event_type']
export type EntityType = NonNullable<UserEvent['entity_type']>

export interface TrackEventInput {
  event_type: EventType
  entity_type?: EntityType
  entity_id?: string
  metadata?: Record<string, unknown>
  neighborhood?: string
}

export interface SearchAnalytics {
  query: string
  category_filter: string | null
  neighborhood: string | null
  search_count: number
  zero_results: number
  day: string
}

export interface BusinessEventStats {
  business_id: string
  views_24h: number
  views_7d: number
  views_30d: number
  whatsapp_clicks_7d: number
  maps_clicks_7d: number
  growth_pct: number | null
}

export interface NeighborhoodHeatmap {
  neighborhood: string
  total_events: number
  unique_sessions: number
  unique_users: number
  searches: number
  business_views: number
  whatsapp_clicks: number
}
