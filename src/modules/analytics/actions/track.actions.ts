'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { TrackingService } from '../services/tracking.service'
import type { TrackEventInput } from '../interfaces'

const trackEventSchema = z.object({
  event_type: z.enum([
    'business_view', 'business_click', 'search_query', 'search_zero_results',
    'category_explore', 'neighborhood_filter', 'whatsapp_click', 'maps_click',
    'incentive_view', 'incentive_save', 'scroll_depth',
  ]),
  entity_type: z.enum(['business', 'category', 'incentive', 'search', 'ad']).optional(),
  entity_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  neighborhood: z.string().max(100).optional(),
  session_id: z.string().min(1).max(64),
})

export async function trackEventAction(input: TrackEventInput & { session_id: string }) {
  const parsed = trackEventSchema.safeParse(input)
  if (!parsed.success) return // silencioso — el tracking no rompe la UX

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = new TrackingService(supabase)
  await service.track(
    {
      event_type: parsed.data.event_type,
      entity_type: parsed.data.entity_type,
      entity_id: parsed.data.entity_id,
      metadata: parsed.data.metadata,
      neighborhood: parsed.data.neighborhood,
    },
    parsed.data.session_id,
    user?.id,
  )
}
