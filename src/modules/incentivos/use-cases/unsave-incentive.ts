import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { ServiceResult } from '../interfaces'

export async function unsaveIncentive(
  supabase: SupabaseClient<Database>,
  userId: string,
  incentiveId: string,
): Promise<ServiceResult<void>> {
  const service = new IncentiveService(supabase)
  return service.unsaveIncentive(userId, incentiveId)
}
