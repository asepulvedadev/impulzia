import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { publishIncentiveSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import type { Incentive, ServiceResult } from '../interfaces'

export async function publishIncentive(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ServiceResult<Incentive>> {
  const service = new IncentiveService(supabase)

  // Get current state for publish validation
  const current = await service.getById(id)
  if (!current.success || !current.data) {
    return { data: null, error: 'Incentivo no encontrado', success: false }
  }

  const validated = publishIncentiveSchema.safeParse(current.data)
  if (!validated.success) {
    return {
      data: null,
      error: validated.error.issues[0]?.message ?? 'El incentivo no cumple los requisitos para publicarse',
      success: false,
    }
  }

  return service.publish(id)
}
