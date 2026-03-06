import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { redeemIncentiveSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import type { RedeemResult, ServiceResult } from '../interfaces'

export async function redeemIncentive(
  supabase: SupabaseClient<Database>,
  userId: string,
  rawInput: unknown,
): Promise<ServiceResult<RedeemResult>> {
  const parsed = redeemIncentiveSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      success: false,
    }
  }

  const service = new IncentiveService(supabase)
  return service.redeemIncentive(userId, parsed.data.incentive_id)
}
