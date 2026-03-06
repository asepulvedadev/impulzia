import type { BusinessService } from '../services/business.service'
import type { BusinessWithCategory, ServiceResult } from '../interfaces'

export async function getBusinessBySlugUseCase(
  service: BusinessService,
  slug: string,
): Promise<ServiceResult<BusinessWithCategory>> {
  return service.getBySlug(slug)
}

export async function getBusinessByIdUseCase(
  service: BusinessService,
  id: string,
): Promise<ServiceResult<BusinessWithCategory>> {
  return service.getById(id)
}
