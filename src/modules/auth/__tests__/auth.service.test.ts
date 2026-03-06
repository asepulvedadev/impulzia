import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../services/auth.service'

// Mock Supabase client
const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}

const mockFrom = vi.fn()

function createMockClient() {
  return { auth: mockAuth, from: mockFrom }
}

const mockSupabase = createMockClient()

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthService(mockSupabase as never)
  })

  describe('signup', () => {
    it('calls supabase auth signUp with correct data', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null,
      })

      const result = await service.signup({
        email: 'test@test.com',
        password: 'Password1',
        fullName: 'Test User',
      })

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password1',
        options: {
          data: { full_name: 'Test User' },
        },
      })
      expect(result.success).toBe(true)
    })

    it('returns error when signup fails', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      })

      const result = await service.signup({
        email: 'test@test.com',
        password: 'Password1',
        fullName: 'Test User',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already registered')
    })
  })

  describe('login', () => {
    it('calls supabase auth signInWithPassword', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: { access_token: 'tok' } },
        error: null,
      })

      const result = await service.login({
        email: 'test@test.com',
        password: 'Password1',
      })

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password1',
      })
      expect(result.success).toBe(true)
    })

    it('returns error on invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await service.login({
        email: 'test@test.com',
        password: 'wrong',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
    })
  })

  describe('logout', () => {
    it('calls supabase auth signOut', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null })

      const result = await service.logout()

      expect(mockAuth.signOut).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('getSession', () => {
    it('returns current session', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      })

      const result = await service.getSession()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('getProfile', () => {
    it('fetches profile by user id', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '123', email: 'test@test.com', full_name: 'Test' },
            error: null,
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await service.getProfile('123')

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('test@test.com')
    })

    it('returns error when profile not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await service.getProfile('nonexistent')

      expect(result.success).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('updates profile with given data', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '123', full_name: 'Updated Name' },
              error: null,
            }),
          }),
        }),
      })
      mockFrom.mockReturnValue({ update: mockUpdate })

      const result = await service.updateProfile('123', { fullName: 'Updated Name' })

      expect(mockFrom).toHaveBeenCalledWith('profiles')
      expect(result.success).toBe(true)
    })
  })
})
