import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { RedemptionWithDetails, ServiceResult } from '../interfaces'

export async function getUserRedemptions(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ServiceResult<RedemptionWithDetails[]>> {
  const service = new IncentiveService(supabase)
  return service.getUserRedemptions(userId)
}
