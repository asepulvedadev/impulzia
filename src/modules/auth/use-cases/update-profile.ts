import { updateProfileSchema } from '../validations/auth.schema'
import type { AuthService } from '../services/auth.service'
import type { AuthResult, UpdateProfileData } from '../interfaces'
import type { Database } from '@/lib/supabase/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export async function updateProfileUseCase(
  service: AuthService,
  userId: string,
  input: UpdateProfileData,
): Promise<AuthResult<ProfileRow>> {
  const validation = updateProfileSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.updateProfile(userId, validation.data)
}
