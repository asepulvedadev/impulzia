import type { BusinessService } from '../services/business.service'
import type { Business, ServiceResult } from '../interfaces'

export async function getMyBusinessUseCase(
  service: BusinessService,
  ownerId: string,
): Promise<ServiceResult<Business>> {
  return service.getByOwnerId(ownerId)
}
