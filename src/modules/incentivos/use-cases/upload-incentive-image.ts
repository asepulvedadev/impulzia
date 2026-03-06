import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { IncentiveService } from '../services/incentive.service'
import type { ServiceResult } from '../interfaces'

export async function uploadIncentiveImage(
  supabase: SupabaseClient<Database>,
  file: File,
  businessId: string,
  incentiveId: string,
): Promise<ServiceResult<string>> {
  const service = new IncentiveService(supabase)
  return service.uploadImage(file, businessId, incentiveId)
}
