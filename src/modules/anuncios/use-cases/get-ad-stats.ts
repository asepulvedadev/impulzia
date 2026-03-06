import type { AdService } from '../services/ad.service'
import type { AdDetailedStats, ServiceResult } from '../interfaces'

export async function getAdStatsUseCase(
  service: AdService,
  adId: string,
  ownerId: string,
): Promise<ServiceResult<AdDetailedStats>> {
  return service.getStats(adId, ownerId)
}
