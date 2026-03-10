'use server'

import { createClient } from '@/lib/supabase/server'
import type { BusinessCard, ServiceResult } from '../interfaces'

const BUSINESS_CARD_SELECT =
  'id, name, slug, short_description, logo_url, cover_url, neighborhood, city, address, phone, whatsapp, latitude, longitude, is_verified, is_featured, subscription_tier, business_categories(name, slug, icon)'

export async function searchBusinessesAction(
  query: string,
  location: string,
): Promise<ServiceResult<BusinessCard[]>> {
  const supabase = await createClient()

  // Obtener usuario autenticado para personalización
  const { data: { user } } = await supabase.auth.getUser()

  let q = supabase
    .from('businesses')
    .select(BUSINESS_CARD_SELECT)
    .eq('is_active', true)
    .limit(50)

  if (query.trim()) {
    q = q.or(
      `name.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%,short_description.ilike.%${query.trim()}%`,
    )
  }

  if (location.trim()) {
    q = q.or(
      `neighborhood.ilike.%${location.trim()}%,city.ilike.%${location.trim()}%,address.ilike.%${location.trim()}%`,
    )
  }

  q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await q

  if (error) {
    return { data: null, error: error.message, success: false }
  }

  let businesses = (data as unknown as BusinessCard[]) ?? []

  // Personalizar orden si hay usuario autenticado
  if (user && businesses.length > 1) {
    const { data: scores } = await supabase.rpc('get_personalized_scores', {
      p_user_id: user.id,
      p_limit: 100,
    })
    if (scores && scores.length > 0) {
      const scoreMap = new Map(scores.map((s) => [s.business_id, s.personalization_score]))
      businesses = [...businesses].sort((a, b) => {
        const sA = scoreMap.get(a.id) ?? 0
        const sB = scoreMap.get(b.id) ?? 0
        // featured siempre primero, luego por score
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
        return sB - sA
      })
    }
  }

  return { data: businesses, error: null, success: true }
}
