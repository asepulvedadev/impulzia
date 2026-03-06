import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { IncentiveStats, ServiceResult } from '../interfaces'

export async function getIncentiveStats(
  supabase: SupabaseClient<Database>,
  incentiveId: string,
): Promise<ServiceResult<IncentiveStats>> {
  const service = new IncentiveService(supabase)
  return service.getStats(incentiveId)
}
