import { adFiltersSchema } from '../validations/ad.schema'
import type { AdService } from '../services/ad.service'
import type { Ad, ServiceResult } from '../interfaces'

export async function getActiveAdsUseCase(
  service: AdService,
  filters: Record<string, unknown>,
): Promise<ServiceResult<Ad[]>> {
  const validation = adFiltersSchema.safeParse(filters)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.getActiveAds(validation.data)
}
