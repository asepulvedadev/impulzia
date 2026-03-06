import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { IncentiveWithStats, ServiceResult } from '../interfaces'

export async function getMyIncentives(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<ServiceResult<IncentiveWithStats[]>> {
  const service = new IncentiveService(supabase)
  return service.getByBusinessId(businessId)
}
