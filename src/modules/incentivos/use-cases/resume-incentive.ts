import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { Incentive, ServiceResult } from '../interfaces'

export async function resumeIncentive(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ServiceResult<Incentive>> {
  const service = new IncentiveService(supabase)
  return service.resume(id)
}
