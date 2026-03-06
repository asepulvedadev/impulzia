import type { AdService } from '../services/ad.service'
import type { AdWithStats, ServiceResult } from '../interfaces'

export async function getMyAdsUseCase(
  service: AdService,
  businessId: string,
  ownerId: string,
): Promise<ServiceResult<AdWithStats[]>> {
  return service.getByBusinessId(businessId, ownerId)
}
