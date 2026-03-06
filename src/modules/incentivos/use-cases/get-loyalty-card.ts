import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { LoyaltyCard, ServiceResult } from '../interfaces'

export async function getLoyaltyCard(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string,
): Promise<ServiceResult<LoyaltyCard | null>> {
  const service = new IncentiveService(supabase)
  return service.getLoyaltyCard(userId, businessId)
}
