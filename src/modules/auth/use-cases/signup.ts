import { signupSchema } from '../validations/auth.schema'
import type { AuthService } from '../services/auth.service'
import type { AuthResult, SignupData } from '../interfaces'

export async function signupUseCase(service: AuthService, input: SignupData): Promise<AuthResult> {
  const validation = signupSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.signup(validation.data)
}
