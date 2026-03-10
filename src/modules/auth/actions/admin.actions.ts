'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AuthResult } from '../interfaces'
import type { Database } from '@/lib/supabase/database.types'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null, adminId: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { supabase: null, adminId: null, error: 'Sin permisos' }
  return { supabase, adminId: user.id, error: null }
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<AuthResult> {
  const { supabase, error } = await requireAdmin()
  if (!supabase) return { data: null, error, success: false }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (updateError) return { data: null, error: updateError.message, success: false }

  revalidatePath('/panel/admin/usuarios')
  return { data: null, error: null, success: true }
}

export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean,
): Promise<AuthResult> {
  const { supabase, error } = await requireAdmin()
  if (!supabase) return { data: null, error, success: false }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (updateError) return { data: null, error: updateError.message, success: false }

  revalidatePath('/panel/admin/usuarios')
  return { data: null, error: null, success: true }
}

export async function deleteUserAction(userId: string): Promise<AuthResult> {
  const { supabase, adminId, error } = await requireAdmin()
  if (!supabase) return { data: null, error, success: false }

  if (userId === adminId) return { data: null, error: 'No puedes eliminarte a ti mismo', success: false }

  const { error: deleteError } = await supabase.from('profiles').delete().eq('id', userId)

  if (deleteError) return { data: null, error: deleteError.message, success: false }

  revalidatePath('/panel/admin/usuarios')
  return { data: null, error: null, success: true }
}

export async function adminToggleBusinessStatusAction(
  businessId: string,
  isActive: boolean,
): Promise<AuthResult> {
  const { supabase, error } = await requireAdmin()
  if (!supabase) return { data: null, error, success: false }

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ is_active: isActive })
    .eq('id', businessId)

  if (updateError) return { data: null, error: updateError.message, success: false }

  revalidatePath('/panel/admin/negocios')
  return { data: null, error: null, success: true }
}

export async function adminDeleteBusinessAction(businessId: string): Promise<AuthResult> {
  const { supabase, error } = await requireAdmin()
  if (!supabase) return { data: null, error, success: false }

  const { error: deleteError } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId)

  if (deleteError) return { data: null, error: deleteError.message, success: false }

  revalidatePath('/panel/admin/negocios')
  return { data: null, error: null, success: true }
}
