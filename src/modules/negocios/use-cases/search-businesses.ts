import { searchBusinessSchema } from '../validations/business.schema'
import type { BusinessService } from '../services/business.service'
import type { BusinessSearchResult, ServiceResult } from '../interfaces'

export async function searchBusinessesUseCase(
  service: BusinessService,
  input: Record<string, unknown>,
): Promise<ServiceResult<BusinessSearchResult>> {
  const validation = searchBusinessSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.search(validation.data)
}
