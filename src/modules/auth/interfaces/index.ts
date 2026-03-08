export type UserRole = 'user' | 'business_owner' | 'admin'

export interface Profile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  onboardingCompleted: boolean
  city: string | null
  createdAt: string
  updatedAt: string
}

export interface SignupData {
  email: string
  password: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UpdateProfileData {
  fullName?: string
  phone?: string
  avatarUrl?: string
  city?: string
}

export interface AuthResult<T = undefined> {
  data: T | null
  error: string | null
  success: boolean
}
