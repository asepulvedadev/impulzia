import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { updateIncentiveSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import type { Incentive, ServiceResult } from '../interfaces'

export async function updateIncentive(
  supabase: SupabaseClient<Database>,
  id: string,
  rawInput: unknown,
): Promise<ServiceResult<Incentive>> {
  const parsed = updateIncentiveSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      success: false,
    }
  }

  const service = new IncentiveService(supabase)
  return service.update(id, parsed.data)
}
