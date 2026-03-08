'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '../services/business.service'
import { createBusinessUseCase } from '../use-cases/create-business'
import { updateBusinessUseCase } from '../use-cases/update-business'
import { saveBusinessHoursUseCase } from '../use-cases/save-business-hours'
import {
  uploadBusinessLogoUseCase,
  uploadBusinessCoverUseCase,
} from '../use-cases/upload-business-image'
import type { ServiceResult, Business } from '../interfaces'

async function getAuthenticatedService() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { service: null, userId: null, role: null, error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    service: new BusinessService(supabase),
    userId: user.id,
    role: profile?.role ?? null,
    error: null,
  }
}

export async function createBusinessAction(
  _prevState: ServiceResult<Business>,
  formData: FormData,
): Promise<ServiceResult<Business>> {
  const { service, userId, role, error } = await getAuthenticatedService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  if (role !== 'business_owner' && role !== 'admin') {
    return { data: null, error: 'No tienes permiso para crear negocios', success: false }
  }

  const input = {
    name: formData.get('name') as string,
    category_id: formData.get('category_id') as string,
    description: (formData.get('description') as string) || undefined,
    short_description: (formData.get('short_description') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    whatsapp: (formData.get('whatsapp') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    neighborhood: (formData.get('neighborhood') as string) || undefined,
    city: (formData.get('city') as string) || 'Cúcuta',
  }

  const result = await createBusinessUseCase(service, input, userId)

  if (result.success) {
    revalidatePath('/panel')
    redirect('/panel/negocio')
  }

  return result
}

export async function updateBusinessAction(
  businessId: string,
  _prevState: ServiceResult<Business>,
  formData: FormData,
): Promise<ServiceResult<Business>> {
  const { service, userId, error } = await getAuthenticatedService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const input: Record<string, string | undefined> = {}
  const fields = [
    'name',
    'description',
    'short_description',
    'category_id',
    'phone',
    'whatsapp',
    'email',
    'website',
    'address',
    'neighborhood',
    'city',
  ]

  for (const field of fields) {
    const value = formData.get(field) as string
    if (value) input[field] = value
  }

  const result = await updateBusinessUseCase(service, businessId, input, userId)

  if (result.success) {
    revalidatePath('/panel/negocio')
    revalidatePath(`/negocio/${result.data?.slug}`)
  }

  return result
}

export async function uploadLogoAction(
  businessId: string,
  formData: FormData,
): Promise<ServiceResult<string>> {
  const { service, userId, error } = await getAuthenticatedService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { data: null, error: 'No se proporcionó archivo', success: false }
  }

  const result = await uploadBusinessLogoUseCase(service, businessId, file, userId)

  if (result.success) {
    revalidatePath('/panel/negocio')
  }

  return result
}

export async function uploadCoverAction(
  businessId: string,
  formData: FormData,
): Promise<ServiceResult<string>> {
  const { service, userId, error } = await getAuthenticatedService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { data: null, error: 'No se proporcionó archivo', success: false }
  }

  const result = await uploadBusinessCoverUseCase(service, businessId, file, userId)

  if (result.success) {
    revalidatePath('/panel/negocio')
  }

  return result
}

export async function saveHoursAction(
  businessId: string,
  hours: unknown,
): Promise<ServiceResult<undefined>> {
  const { service, userId, error } = await getAuthenticatedService()
  if (!service || !userId) {
    return { data: null, error: error ?? 'No autenticado', success: false }
  }

  const result = await saveBusinessHoursUseCase(service, businessId, hours, userId)

  if (result.success) {
    revalidatePath('/panel/negocio')
  }

  return result
}
