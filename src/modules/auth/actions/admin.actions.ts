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
  if (!user) return { supabase: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { supabase: null, error: 'Sin permisos' }
  return { supabase, error: null }
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

  revalidatePath('/panel/admin')
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

  revalidatePath('/panel/admin')
  return { data: null, error: null, success: true }
}
