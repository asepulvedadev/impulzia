import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { AuthResult, SignupData, LoginData, UpdateProfileData } from '../interfaces'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async signup(data: SignupData): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    })

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: null, error: null, success: true }
  }

  async login(data: LoginData): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: null, error: null, success: true }
  }

  async logout(): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: null, error: null, success: true }
  }

  async getSession(): Promise<AuthResult<{ user: { id: string } }>> {
    const { data, error } = await this.supabase.auth.getSession()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    if (!data.session) {
      return { data: null, error: null, success: true }
    }

    return {
      data: { user: { id: data.session.user.id } },
      error: null,
      success: true,
    }
  }

  async getProfile(userId: string): Promise<AuthResult<ProfileRow>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as ProfileRow, error: null, success: true }
  }

  async updateProfile(userId: string, input: UpdateProfileData): Promise<AuthResult<ProfileRow>> {
    const updateData: ProfileUpdate = {}
    if (input.fullName !== undefined) updateData.full_name = input.fullName
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl || null
    if (input.city !== undefined) updateData.city = input.city

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as ProfileRow, error: null, success: true }
  }
}
