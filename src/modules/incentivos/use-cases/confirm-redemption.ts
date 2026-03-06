import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { validateTokenSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import type { Redemption, ServiceResult } from '../interfaces'

export async function confirmRedemption(
  supabase: SupabaseClient<Database>,
  confirmedBy: string,
  rawInput: unknown,
): Promise<ServiceResult<Redemption>> {
  const parsed = validateTokenSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? 'Token inválido',
      success: false,
    }
  }

  const service = new IncentiveService(supabase)
  return service.confirmRedemption(parsed.data.token, confirmedBy)
}
