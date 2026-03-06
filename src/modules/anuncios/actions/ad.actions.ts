'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis/client'
import { AdService } from '../services/ad.service'
import { TrackingService } from '../services/tracking.service'
import { createAdUseCase } from '../use-cases/create-ad'
import { updateAdUseCase } from '../use-cases/update-ad'
import { publishAdUseCase } from '../use-cases/publish-ad'
import { pauseAdUseCase } from '../use-cases/pause-ad'
import { resumeAdUseCase } from '../use-cases/resume-ad'
import { deleteAdUseCase } from '../use-cases/delete-ad'
import { uploadAdImageUseCase } from '../use-cases/upload-ad-image'
import type { Ad, ServiceResult } from '../interfaces'

async function getAuthenticatedAdService() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { service: null, userId: null, error: 'No autenticado' }
  }

  const service = new AdService(supabase)
  return { service, userId: user.id, error: null }
}

export async function createAdAction(
  businessId: string,
  _prevState: ServiceResult<Ad>,
  formData: FormData,
): Promise<ServiceResult<Ad>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const input: Record<string, unknown> = {
    title: formData.get('title') as string,
    type: formData.get('type') as string,
    description: (formData.get('description') as string) || undefined,
    image_url: (formData.get('image_url') as string) || undefined,
    cta_text: (formData.get('cta_text') as string) || undefined,
    cta_url: (formData.get('cta_url') as string) || undefined,
    schedule_start: (formData.get('schedule_start') as string) || undefined,
    schedule_end: (formData.get('schedule_end') as string) || undefined,
  }

  const targetCategories = formData.getAll('target_categories[]') as string[]
  if (targetCategories.length > 0) input.target_categories = targetCategories

  const targetNeighborhoods = formData.getAll('target_neighborhoods[]') as string[]
  if (targetNeighborhoods.length > 0) input.target_neighborhoods = targetNeighborhoods

  const dailyStart = formData.get('daily_start_hour')
  if (dailyStart) input.daily_start_hour = Number(dailyStart)

  const dailyEnd = formData.get('daily_end_hour')
  if (dailyEnd) input.daily_end_hour = Number(dailyEnd)

  const result = await createAdUseCase(service, input, userId, businessId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
  }

  return result
}

export async function updateAdAction(
  adId: string,
  _prevState: ServiceResult<Ad>,
  formData: FormData,
): Promise<ServiceResult<Ad>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const input: Record<string, unknown> = {}
  const fields = [
    'title',
    'description',
    'image_url',
    'cta_text',
    'cta_url',
    'schedule_start',
    'schedule_end',
  ]
  for (const field of fields) {
    const value = formData.get(field) as string
    if (value) input[field] = value
  }

  const targetCategories = formData.getAll('target_categories[]') as string[]
  if (targetCategories.length > 0) input.target_categories = targetCategories

  const targetNeighborhoods = formData.getAll('target_neighborhoods[]') as string[]
  if (targetNeighborhoods.length > 0) input.target_neighborhoods = targetNeighborhoods

  const dailyStart = formData.get('daily_start_hour')
  if (dailyStart) input.daily_start_hour = Number(dailyStart)

  const dailyEnd = formData.get('daily_end_hour')
  if (dailyEnd) input.daily_end_hour = Number(dailyEnd)

  const result = await updateAdUseCase(service, adId, input, userId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
    revalidatePath(`/panel/anuncios/${adId}`)
  }

  return result
}

export async function publishAdAction(adId: string): Promise<ServiceResult<Ad>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const result = await publishAdUseCase(service, adId, userId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
    revalidatePath(`/panel/anuncios/${adId}`)
  }

  return result
}

export async function pauseAdAction(adId: string): Promise<ServiceResult<Ad>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const result = await pauseAdUseCase(service, adId, userId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
    revalidatePath(`/panel/anuncios/${adId}`)
  }

  return result
}

export async function resumeAdAction(adId: string): Promise<ServiceResult<Ad>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const result = await resumeAdUseCase(service, adId, userId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
    revalidatePath(`/panel/anuncios/${adId}`)
  }

  return result
}

export async function deleteAdAction(adId: string): Promise<ServiceResult<void>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const result = await deleteAdUseCase(service, adId, userId)

  if (result.success) {
    revalidatePath('/panel/anuncios')
  }

  return result
}

export async function uploadAdImageAction(
  adId: string,
  formData: FormData,
): Promise<ServiceResult<string>> {
  const { service, userId, error } = await getAuthenticatedAdService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { data: null, error: 'No se proporcionó archivo', success: false }
  }

  const result = await uploadAdImageUseCase(service, adId, file, userId)

  if (result.success) {
    revalidatePath(`/panel/anuncios/${adId}`)
  }

  return result
}

export async function trackImpressionAction(
  adId: string,
  context: string,
  viewerId?: string,
): Promise<void> {
  const supabase = await createClient()
  const redis = getRedis()
  const trackingService = new TrackingService(supabase, redis)

  await trackingService.trackImpression(
    adId,
    viewerId,
    undefined,
    context as 'feed' | 'explorer' | 'business_profile' | 'search',
  )
}

export async function trackClickAction(
  adId: string,
  impressionId?: string,
  viewerId?: string,
): Promise<void> {
  const supabase = await createClient()
  const redis = getRedis()
  const trackingService = new TrackingService(supabase, redis)

  await trackingService.trackClick(adId, impressionId, viewerId)
}
