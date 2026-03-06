import { createAdSchema } from '../validations/ad.schema'
import type { AdService } from '../services/ad.service'
import type { Ad, ServiceResult } from '../interfaces'

export async function createAdUseCase(
  service: AdService,
  input: Record<string, unknown>,
  ownerId: string,
  businessId: string,
): Promise<ServiceResult<Ad>> {
  const validation = createAdSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.create(validation.data, ownerId, businessId)
}
