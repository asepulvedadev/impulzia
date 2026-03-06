'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '../services/auth.service'
import { signupUseCase } from '../use-cases/signup'
import { loginUseCase } from '../use-cases/login'
import { logoutUseCase } from '../use-cases/logout'
import { updateProfileUseCase } from '../use-cases/update-profile'
import type { AuthResult } from '../interfaces'
import type { Database } from '@/lib/supabase/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export async function signupAction(
  _prevState: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const supabase = await createClient()
  const service = new AuthService(supabase)

  const result = await signupUseCase(service, {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  })

  return result
}

export async function loginAction(_prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  const service = new AuthService(supabase)

  const result = await loginUseCase(service, {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (result.success) {
    revalidatePath('/', 'layout')
    redirect('/panel')
  }

  return result
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  const service = new AuthService(supabase)

  await logoutUseCase(service)
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfileAction(
  _prevState: AuthResult<ProfileRow>,
  formData: FormData,
): Promise<AuthResult<ProfileRow>> {
  const supabase = await createClient()
  const service = new AuthService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado', success: false }
  }

  const result = await updateProfileUseCase(service, user.id, {
    fullName: (formData.get('fullName') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    avatarUrl: (formData.get('avatarUrl') as string) || undefined,
  })

  if (result.success) {
    revalidatePath('/panel')
  }

  return result
}
