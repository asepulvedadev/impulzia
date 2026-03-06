import type { BusinessService } from '../services/business.service'
import type { ServiceResult } from '../interfaces'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes JPEG, PNG o WebP'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La imagen no puede pesar más de 5MB'
  }
  return null
}

export async function uploadBusinessLogoUseCase(
  service: BusinessService,
  businessId: string,
  file: File,
  ownerId: string,
): Promise<ServiceResult<string>> {
  const error = validateFile(file)
  if (error) {
    return { data: null, error, success: false }
  }

  return service.uploadLogo(businessId, file, ownerId)
}

export async function uploadBusinessCoverUseCase(
  service: BusinessService,
  businessId: string,
  file: File,
  ownerId: string,
): Promise<ServiceResult<string>> {
  const error = validateFile(file)
  if (error) {
    return { data: null, error, success: false }
  }

  return service.uploadCover(businessId, file, ownerId)
}
