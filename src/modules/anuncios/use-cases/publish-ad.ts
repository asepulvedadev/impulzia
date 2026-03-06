import type { AdService } from '../services/ad.service'
import type { Ad, ServiceResult } from '../interfaces'

export async function publishAdUseCase(
  service: AdService,
  adId: string,
  ownerId: string,
): Promise<ServiceResult<Ad>> {
  return service.publish(adId, ownerId)
}
