import { updateBusinessSchema } from '../validations/business.schema'
import type { BusinessService } from '../services/business.service'
import type { Business, ServiceResult } from '../interfaces'

export async function updateBusinessUseCase(
  service: BusinessService,
  businessId: string,
  input: Record<string, unknown>,
  ownerId: string,
): Promise<ServiceResult<Business>> {
  const validation = updateBusinessSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.update(businessId, validation.data, ownerId)
}
