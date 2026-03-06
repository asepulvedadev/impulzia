import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { IncentiveWithBusiness, ServiceResult } from '../interfaces'

export async function getIncentiveById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ServiceResult<IncentiveWithBusiness>> {
  const service = new IncentiveService(supabase)
  return service.getById(id)
}
