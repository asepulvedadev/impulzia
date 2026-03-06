import type { AdService } from '../services/ad.service'
import type { ServiceResult } from '../interfaces'

export async function uploadAdImageUseCase(
  service: AdService,
  adId: string,
  file: File,
  ownerId: string,
): Promise<ServiceResult<string>> {
  if (!file) {
    return { data: null, error: 'No se proporcionó ningún archivo', success: false }
  }

  return service.uploadImage(adId, file, ownerId)
}
