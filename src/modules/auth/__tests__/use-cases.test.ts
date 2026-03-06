import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signupUseCase } from '../use-cases/signup'
import { loginUseCase } from '../use-cases/login'
import { logoutUseCase } from '../use-cases/logout'
import { updateProfileUseCase } from '../use-cases/update-profile'
import type { AuthService } from '../services/auth.service'

const mockService: Partial<AuthService> = {
  signup: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
}

describe('signupUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates input and calls service on valid data', async () => {
    vi.mocked(mockService.signup!).mockResolvedValue({
      data: null,
      error: null,
      success: true,
    })

    const result = await signupUseCase(mockService as AuthService, {
      email: 'user@test.com',
      password: 'Password1',
      fullName: 'Test User',
    })

    expect(mockService.signup).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'Password1',
      fullName: 'Test User',
    })
    expect(result.success).toBe(true)
  })

  it('returns validation error on invalid data without calling service', async () => {
    const result = await signupUseCase(mockService as AuthService, {
      email: 'bad-email',
      password: '123',
      fullName: '',
    })

    expect(mockService.signup).not.toHaveBeenCalled()
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})

describe('loginUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates and calls service on valid data', async () => {
    vi.mocked(mockService.login!).mockResolvedValue({
      data: null,
      error: null,
      success: true,
    })

    const result = await loginUseCase(mockService as AuthService, {
      email: 'user@test.com',
      password: 'anypass',
    })

    expect(mockService.login).toHaveBeenCalled()
    expect(result.success).toBe(true)
  })

  it('returns validation error on missing fields', async () => {
    const result = await loginUseCase(mockService as AuthService, {
      email: '',
      password: '',
    })

    expect(mockService.login).not.toHaveBeenCalled()
    expect(result.success).toBe(false)
  })
})

describe('logoutUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls service logout', async () => {
    vi.mocked(mockService.logout!).mockResolvedValue({
      data: null,
      error: null,
      success: true,
    })

    const result = await logoutUseCase(mockService as AuthService)

    expect(mockService.logout).toHaveBeenCalled()
    expect(result.success).toBe(true)
  })
})

describe('updateProfileUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates and calls service with userId', async () => {
    vi.mocked(mockService.updateProfile!).mockResolvedValue({
      data: null,
      error: null,
      success: true,
    })

    const result = await updateProfileUseCase(mockService as AuthService, '123', {
      fullName: 'New Name',
    })

    expect(mockService.updateProfile).toHaveBeenCalledWith('123', { fullName: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('returns validation error on invalid data', async () => {
    const result = await updateProfileUseCase(mockService as AuthService, '123', {
      fullName: 'A',
    })

    expect(mockService.updateProfile).not.toHaveBeenCalled()
    expect(result.success).toBe(false)
  })
})
