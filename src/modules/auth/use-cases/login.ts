import { loginSchema } from '../validations/auth.schema'
import type { AuthService } from '../services/auth.service'
import type { AuthResult, LoginData } from '../interfaces'

export async function loginUseCase(service: AuthService, input: LoginData): Promise<AuthResult> {
  const validation = loginSchema.safeParse(input)
  if (!validation.success) {
    const message = validation.error.issues.map((i) => i.message).join(', ')
    return { data: null, error: message, success: false }
  }

  return service.login(validation.data)
}
