import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { TrackEventInput } from '../interfaces'

export class TrackingService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async track(
    input: TrackEventInput,
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    await this.supabase.from('user_events').insert({
      session_id: sessionId,
      user_id: userId ?? null,
      event_type: input.event_type,
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
      metadata: (input.metadata ?? {}) as Database['public']['Tables']['user_events']['Insert']['metadata'],
      neighborhood: input.neighborhood ?? null,
    })
    // No lanzamos error si falla — el tracking no debe romper la UX
  }

  async getTopSearches(limit = 20): Promise<{ query: string; count: number }[]> {
    const { data } = await this.supabase
      .from('user_events')
      .select('metadata')
      .eq('event_type', 'search_query')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (!data) return []

    const counts: Record<string, number> = {}
    for (const row of data) {
      const q = (row.metadata as Record<string, unknown>)?.query
      if (typeof q === 'string' && q.trim()) {
        const key = q.trim().toLowerCase()
        counts[key] = (counts[key] ?? 0) + 1
      }
    }

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }))
  }

  async getBusinessStats(businessId: string): Promise<{
    views_7d: number
    whatsapp_clicks_7d: number
    maps_clicks_7d: number
  }> {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data } = await this.supabase
      .from('user_events')
      .select('event_type')
      .eq('entity_id', businessId)
      .eq('entity_type', 'business')
      .gte('created_at', since7d)

    if (!data) return { views_7d: 0, whatsapp_clicks_7d: 0, maps_clicks_7d: 0 }

    return {
      views_7d: data.filter((e) => e.event_type === 'business_view').length,
      whatsapp_clicks_7d: data.filter((e) => e.event_type === 'whatsapp_click').length,
      maps_clicks_7d: data.filter((e) => e.event_type === 'maps_click').length,
    }
  }

  async getUserPreferences(userId: string) {
    const { data } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('affinity_score', { ascending: false })
      .limit(5)

    return data ?? []
  }

  async recalculateAffinity(userId: string): Promise<void> {
    await this.supabase.rpc('recalculate_user_affinity', { p_user_id: userId })
  }
}
