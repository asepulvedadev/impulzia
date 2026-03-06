import { businessHoursSchema } from '../validations/business.schema'
import type { BusinessService } from '../services/business.service'
import type { ServiceResult } from '../interfaces'

export async function saveBusinessHoursUseCase(
  service: BusinessService,
  businessId: string,
  input: unknown,
  ownerId: string,
): Promise<ServiceResult<undefined>> {
  const validation = businessHoursSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  const hours = validation.data.map((h) => ({
    business_id: businessId,
    day_of_week: h.day_of_week,
    open_time: h.open_time,
    close_time: h.close_time,
    is_closed: h.is_closed,
  }))

  return service.saveHours(businessId, hours, ownerId)
}
