'use server'

import { createClient } from '@/lib/supabase/server'
import { AnalyticsService } from '../services/analytics.service'
import { TrackingService } from '../services/tracking.service'

/** Stats del negocio del dueño autenticado */
export async function getMyBusinessStatsAction(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = new AnalyticsService(supabase)
  return service.getBusinessStats(businessId)
}

/** Comparar negocio vs categoría */
export async function compareWithCategoryAction(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = new AnalyticsService(supabase)
  return service.compareWithCategory(businessId)
}

/** Top búsquedas — solo admin */
export async function getTopSearchesAction(limit = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return []

  const service = new AnalyticsService(supabase)
  return service.getTopSearches(limit)
}

/** Búsquedas sin resultados — solo admin */
export async function getZeroResultSearchesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return []

  const service = new AnalyticsService(supabase)
  return service.getZeroResultSearches()
}

/** Heatmap de barrios — solo admin */
export async function getNeighborhoodHeatmapAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return []

  const service = new AnalyticsService(supabase)
  return service.getNeighborhoodHeatmap()
}

/** Preferencias del usuario actual */
export async function getMyPreferencesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const service = new TrackingService(supabase)
  return service.getUserPreferences(user.id)
}
