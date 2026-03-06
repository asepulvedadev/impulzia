import type { BusinessService } from '../services/business.service'
import type { BusinessCategory, ServiceResult } from '../interfaces'

export async function getCategoriesUseCase(
  service: BusinessService,
): Promise<ServiceResult<BusinessCategory[]>> {
  return service.getCategories()
}
