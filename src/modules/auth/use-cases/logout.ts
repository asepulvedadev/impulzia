import type { AuthService } from '../services/auth.service'
import type { AuthResult } from '../interfaces'

export async function logoutUseCase(service: AuthService): Promise<AuthResult> {
  return service.logout()
}
