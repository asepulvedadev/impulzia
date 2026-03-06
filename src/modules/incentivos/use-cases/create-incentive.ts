import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { createIncentiveSchema } from '../validations/incentive.schema'
import { IncentiveService } from '../services/incentive.service'
import { INCENTIVE_PLAN_LIMITS } from '../interfaces'
import type { Incentive, ServiceResult } from '../interfaces'

export async function createIncentive(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string,
  subscriptionTier: string,
  rawInput: unknown,
): Promise<ServiceResult<Incentive>> {
  const parsed = createIncentiveSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      success: false,
    }
  }

  const service = new IncentiveService(supabase)

  // Check plan limits
  const limit = INCENTIVE_PLAN_LIMITS[subscriptionTier] ?? INCENTIVE_PLAN_LIMITS.free
  const currentCount = await service.getActiveIncentiveCount(businessId)
  if (currentCount >= limit) {
    return {
      data: null,
      error: `Has alcanzado el límite de ${limit} incentivos activos en tu plan`,
      success: false,
    }
  }

  return service.create(parsed.data, businessId, userId)
}
