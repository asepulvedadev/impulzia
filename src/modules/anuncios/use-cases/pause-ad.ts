import type { AdService } from '../services/ad.service'
import type { Ad, ServiceResult } from '../interfaces'

export async function pauseAdUseCase(
  service: AdService,
  adId: string,
  ownerId: string,
): Promise<ServiceResult<Ad>> {
  return service.pause(adId, ownerId)
}
