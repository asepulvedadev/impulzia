import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { incentiveFiltersSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import type { IncentiveWithBusiness, IncentiveFilters, ServiceResult } from '../interfaces'

export async function getActiveIncentives(
  supabase: SupabaseClient<Database>,
  rawFilters: Partial<IncentiveFilters>,
): Promise<ServiceResult<IncentiveWithBusiness[]>> {
  const parsed = incentiveFiltersSchema.safeParse(rawFilters)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? 'Filtros inválidos',
      success: false,
    }
  }

  const service = new IncentiveService(supabase)
  return service.getActiveIncentives(parsed.data)
}
