import { updateAdSchema } from '../validations/ad.schema'
import type { AdService } from '../services/ad.service'
import type { Ad, ServiceResult } from '../interfaces'

export async function updateAdUseCase(
  service: AdService,
  adId: string,
  input: Record<string, unknown>,
  ownerId: string,
): Promise<ServiceResult<Ad>> {
  const validation = updateAdSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.update(adId, validation.data, ownerId)
}
