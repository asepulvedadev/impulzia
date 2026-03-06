import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { RedemptionWithDetails, ServiceResult } from '../interfaces'

export async function getBusinessRedemptions(
  supabase: SupabaseClient<Database>,
  businessId: string,
  limit = 20,
): Promise<ServiceResult<RedemptionWithDetails[]>> {
  const service = new IncentiveService(supabase)
  return service.getRedemptionsByBusiness(businessId, limit)
}
