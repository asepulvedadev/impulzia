import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { LoyaltyCard, ServiceResult } from '../interfaces'

export async function addStamp(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string,
): Promise<ServiceResult<LoyaltyCard>> {
  const service = new IncentiveService(supabase)
  return service.addStamp(userId, businessId)
}
