'use server'

import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '../services/incentive.service'
import { createIncentive } from '../use-cases/create-incentive'
import { updateIncentive } from '../use-cases/update-incentive'
import { publishIncentive } from '../use-cases/publish-incentive'
import { pauseIncentive } from '../use-cases/pause-incentive'
import { resumeIncentive } from '../use-cases/resume-incentive'
import { deleteIncentive } from '../use-cases/delete-incentive'
import { redeemIncentive } from '../use-cases/redeem-incentive'
import { confirmRedemption } from '../use-cases/confirm-redemption'
import { saveIncentive } from '../use-cases/save-incentive'
import { unsaveIncentive as _unsave } from '../use-cases/unsave-incentive'
import type { Incentive, Redemption, ServiceResult } from '../interfaces'

// ─────────────────────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────────────────────
async function getAuthContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'No autenticado' }
  return { supabase, user, error: null }
}

async function getBusinessContext(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: business } = await supabase
    .from('businesses')
    .select('id, subscription_tier')
    .eq('owner_id', userId)
    .single()

  if (!business) return { business: null, error: 'Negocio no encontrado' }
  return { business, error: null }
}

// ─────────────────────────────────────────────────────────
// Owner actions
// ─────────────────────────────────────────────────────────

export async function createIncentiveAction(rawInput: unknown): Promise<ServiceResult<Incentive>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  const { business, error: bizError } = await getBusinessContext(supabase, user.id)
  if (!business) return { data: null, error: bizError ?? 'Negocio no encontrado', success: false }

  return createIncentive(supabase, user.id, business.id, business.subscription_tier, rawInput)
}

export async function updateIncentiveAction(
  id: string,
  rawInput: unknown,
): Promise<ServiceResult<Incentive>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return updateIncentive(supabase, id, rawInput)
}

export async function publishIncentiveAction(id: string): Promise<ServiceResult<Incentive>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return publishIncentive(supabase, id)
}

export async function pauseIncentiveAction(id: string): Promise<ServiceResult<Incentive>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return pauseIncentive(supabase, id)
}

export async function resumeIncentiveAction(id: string): Promise<ServiceResult<Incentive>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return resumeIncentive(supabase, id)
}

export async function deleteIncentiveAction(id: string): Promise<ServiceResult<void>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return deleteIncentive(supabase, id)
}

export async function uploadIncentiveImageAction(
  formData: FormData,
): Promise<ServiceResult<string>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  const { business, error: bizError } = await getBusinessContext(supabase, user.id)
  if (!business) return { data: null, error: bizError ?? 'Negocio no encontrado', success: false }

  const file = formData.get('file') as File | null
  const incentiveId = formData.get('incentive_id') as string | null

  if (!file || !incentiveId) {
    return { data: null, error: 'Archivo e ID son requeridos', success: false }
  }

  const service = new IncentiveService(supabase)
  return service.uploadImage(file, business.id, incentiveId)
}

export async function confirmRedemptionAction(token: string): Promise<ServiceResult<Redemption>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return confirmRedemption(supabase, user.id, { token })
}

// ─────────────────────────────────────────────────────────
// User actions
// ─────────────────────────────────────────────────────────

export async function redeemIncentiveAction(
  incentiveId: string,
): Promise<ServiceResult<{ redemption_id: string; token: string; incentive_title: string; expires_at: string }>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return redeemIncentive(supabase, user.id, { incentive_id: incentiveId })
}

export async function saveIncentiveAction(incentiveId: string): Promise<ServiceResult<void>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return saveIncentive(supabase, user.id, incentiveId)
}

export async function unsaveIncentiveAction(incentiveId: string): Promise<ServiceResult<void>> {
  const { supabase, user, error } = await getAuthContext()
  if (!user) return { data: null, error: error ?? 'No autenticado', success: false }

  return _unsave(supabase, user.id, incentiveId)
}
