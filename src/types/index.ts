export type UserRole = 'user' | 'business_owner' | 'admin'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}
