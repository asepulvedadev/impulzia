import type { AdService } from '../services/ad.service'
import type { ServiceResult } from '../interfaces'

export async function deleteAdUseCase(
  service: AdService,
  adId: string,
  ownerId: string,
): Promise<ServiceResult<void>> {
  return service.delete(adId, ownerId)
}
