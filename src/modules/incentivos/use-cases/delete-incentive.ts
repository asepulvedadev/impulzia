import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { ServiceResult } from '../interfaces'

export async function deleteIncentive(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ServiceResult<void>> {
  const service = new IncentiveService(supabase)
  return service.delete(id)
}
