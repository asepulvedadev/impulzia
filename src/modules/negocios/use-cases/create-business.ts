import { createBusinessSchema } from '../validations/business.schema'
import type { BusinessService } from '../services/business.service'
import type { Business, ServiceResult } from '../interfaces'

export async function createBusinessUseCase(
  service: BusinessService,
  input: Record<string, unknown>,
  ownerId: string,
): Promise<ServiceResult<Business>> {
  const validation = createBusinessSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  // Check if user already has a business
  const existing = await service.getByOwnerId(ownerId)
  if (existing.data) {
    return { data: null, error: 'Ya tienes un negocio registrado', success: false }
  }

  return service.create(validation.data, ownerId)
}
