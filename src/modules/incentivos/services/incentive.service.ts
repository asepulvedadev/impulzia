import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type {
  Incentive,
  IncentiveWithStats,
  IncentiveWithBusiness,
  Redemption,
  RedemptionWithDetails,
  LoyaltyCard,
  IncentiveStats,
  ServiceResult,
  IncentiveFilters,
  RedeemResult,
} from '../interfaces'
import type { CreateIncentiveInput, UpdateIncentiveInput } from '../validations/incentive.schema'

type DB = Database

export class IncentiveService {
  constructor(private readonly supabase: SupabaseClient<DB>) {}

  // ─────────────────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────────────────

  async create(
    input: CreateIncentiveInput,
    businessId: string,
    ownerId: string,
  ): Promise<ServiceResult<Incentive>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .insert({
        ...input,
        business_id: businessId,
        owner_id: ownerId,
        status: 'draft',
        code: input.code?.toUpperCase(),
      })
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as Incentive, error: null, success: true }
  }

  async getById(id: string): Promise<ServiceResult<IncentiveWithBusiness>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .select(
        `
        *,
        business:businesses(id, name, slug, logo_url, neighborhood, city)
      `,
      )
      .eq('id', id)
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as IncentiveWithBusiness, error: null, success: true }
  }

  async getByBusinessId(businessId: string): Promise<ServiceResult<IncentiveWithStats[]>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message, success: false }

    // Fetch stats separately for each
    const withStats = await Promise.all(
      ((data ?? []) as Incentive[]).map(async (incentive) => {
        const { data: statsRaw } = await this.supabase
          .from('incentive_stats')
          .select('*')
          .eq('incentive_id', incentive.id)
          .single()
        return { ...incentive, stats: (statsRaw as IncentiveStats | null) ?? null }
      }),
    )

    return { data: withStats, error: null, success: true }
  }

  async update(id: string, input: UpdateIncentiveInput): Promise<ServiceResult<Incentive>> {
    const updateData = {
      ...input,
      code: input.code?.toUpperCase(),
    }

    const { data, error } = await this.supabase
      .from('incentives')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as Incentive, error: null, success: true }
  }

  async publish(id: string): Promise<ServiceResult<Incentive>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .update({ status: 'active' })
      .eq('id', id)
      .in('status', ['draft', 'paused'])
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    if (!data)
      return { data: null, error: 'Incentivo no encontrado o no se puede publicar', success: false }
    return { data: data as Incentive, error: null, success: true }
  }

  async pause(id: string): Promise<ServiceResult<Incentive>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('status', 'active')
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    if (!data)
      return { data: null, error: 'Incentivo no encontrado o no está activo', success: false }
    return { data: data as Incentive, error: null, success: true }
  }

  async resume(id: string): Promise<ServiceResult<Incentive>> {
    const { data, error } = await this.supabase
      .from('incentives')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('status', 'paused')
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    if (!data)
      return { data: null, error: 'Incentivo no encontrado o no está pausado', success: false }
    return { data: data as Incentive, error: null, success: true }
  }

  async delete(id: string): Promise<ServiceResult<void>> {
    const { error } = await this.supabase
      .from('incentives')
      .delete()
      .eq('id', id)
      .in('status', ['draft', 'paused', 'expired', 'depleted'])

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Public discovery
  // ─────────────────────────────────────────────────────────

  async getActiveIncentives(
    filters: IncentiveFilters,
  ): Promise<ServiceResult<IncentiveWithBusiness[]>> {
    let query = this.supabase
      .from('incentives')
      .select(
        `
        *,
        business:businesses(id, name, slug, logo_url, neighborhood, city)
      `,
      )
      .eq('status', 'active')
      .or('end_date.is.null,end_date.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 12)

    if (filters.type) query = query.eq('type', filters.type)
    if (filters.business_id) query = query.eq('business_id', filters.business_id)
    if (filters.neighborhood) {
      query = query.contains('target_neighborhoods', [filters.neighborhood])
    }
    if (filters.city) {
      query = query.contains('target_cities', [filters.city])
    }
    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset ?? 0) + (filters.limit ?? 12) - 1)
    }

    const { data, error } = await query

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as IncentiveWithBusiness[], error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────

  async getStats(incentiveId: string): Promise<ServiceResult<IncentiveStats>> {
    const { data: statsRaw, error } = await this.supabase
      .from('incentive_stats')
      .select('*')
      .eq('incentive_id', incentiveId)
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: statsRaw as IncentiveStats, error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Plan limits
  // ─────────────────────────────────────────────────────────

  async getActiveIncentiveCount(businessId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('incentives')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active')

    if (error || count === null) return 0
    return count
  }

  // ─────────────────────────────────────────────────────────
  // Image upload
  // ─────────────────────────────────────────────────────────

  async uploadImage(
    file: File,
    businessId: string,
    incentiveId: string,
  ): Promise<ServiceResult<string>> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `incentives/${businessId}/${incentiveId}.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from('business-assets')
      .upload(path, file, { upsert: true })

    if (uploadError) return { data: null, error: uploadError.message, success: false }

    const { data } = this.supabase.storage.from('business-assets').getPublicUrl(path)
    return { data: data.publicUrl, error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Redemptions
  // ─────────────────────────────────────────────────────────

  async redeemIncentive(userId: string, incentiveId: string): Promise<ServiceResult<RedeemResult>> {
    const { data, error } = await this.supabase.rpc('redeem_incentive', {
      p_user_id: userId,
      p_incentive_id: incentiveId,
    })

    if (error) return { data: null, error: error.message, success: false }

    const result = data as unknown as { error?: string } & RedeemResult
    if (result.error) return { data: null, error: result.error, success: false }

    return { data: result as unknown as RedeemResult, error: null, success: true }
  }

  async confirmRedemption(token: string, confirmedBy: string): Promise<ServiceResult<Redemption>> {
    const { data, error } = await this.supabase
      .from('redemptions')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: confirmedBy,
      })
      .eq('redemption_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    if (!data)
      return { data: null, error: 'Token inválido, expirado o ya confirmado', success: false }
    return { data: data as Redemption, error: null, success: true }
  }

  async getRedemptionsByBusiness(
    businessId: string,
    limit = 20,
  ): Promise<ServiceResult<RedemptionWithDetails[]>> {
    const { data, error } = await this.supabase
      .from('redemptions')
      .select(
        `
        *,
        incentive:incentives(id, title, type, discount_type, discount_value),
        user:profiles(id, full_name, email)
      `,
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as RedemptionWithDetails[], error: null, success: true }
  }

  async getUserRedemptions(userId: string): Promise<ServiceResult<RedemptionWithDetails[]>> {
    const { data, error } = await this.supabase
      .from('redemptions')
      .select(
        `
        *,
        incentive:incentives(id, title, type, discount_type, discount_value),
        user:profiles(id, full_name, email)
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as RedemptionWithDetails[], error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Saved incentives
  // ─────────────────────────────────────────────────────────

  async saveIncentive(userId: string, incentiveId: string): Promise<ServiceResult<void>> {
    const { error } = await this.supabase
      .from('saved_incentives')
      .insert({ user_id: userId, incentive_id: incentiveId })

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  }

  async unsaveIncentive(userId: string, incentiveId: string): Promise<ServiceResult<void>> {
    const { error } = await this.supabase
      .from('saved_incentives')
      .delete()
      .eq('user_id', userId)
      .eq('incentive_id', incentiveId)

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  }

  async getUserSavedIncentives(userId: string): Promise<ServiceResult<IncentiveWithBusiness[]>> {
    const { data, error } = await this.supabase
      .from('saved_incentives')
      .select(
        `
        incentive:incentives(
          *,
          business:businesses(id, name, slug, logo_url, neighborhood, city)
        )
      `,
      )
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (error) return { data: null, error: error.message, success: false }

    const incentives = (data ?? [])
      .map((item) => item.incentive)
      .filter(Boolean) as IncentiveWithBusiness[]

    return { data: incentives, error: null, success: true }
  }

  // ─────────────────────────────────────────────────────────
  // Loyalty cards
  // ─────────────────────────────────────────────────────────

  async getLoyaltyCard(
    userId: string,
    businessId: string,
  ): Promise<ServiceResult<LoyaltyCard | null>> {
    const { data, error } = await this.supabase
      .from('loyalty_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .maybeSingle()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as LoyaltyCard | null, error: null, success: true }
  }

  async addStamp(userId: string, businessId: string): Promise<ServiceResult<LoyaltyCard>> {
    // Upsert: create or increment
    const existing = await this.getLoyaltyCard(userId, businessId)

    if (!existing.success) return { data: null, error: existing.error, success: false }

    if (!existing.data) {
      // Create new card
      const { data, error } = await this.supabase
        .from('loyalty_cards')
        .insert({ user_id: userId, business_id: businessId, total_stamps: 1 })
        .select()
        .single()

      if (error) return { data: null, error: error.message, success: false }
      return { data: data as LoyaltyCard, error: null, success: true }
    }

    // Increment stamps, check for reward
    const newStamps = existing.data.total_stamps + 1
    const newRewards =
      existing.data.rewards_earned + (newStamps % existing.data.stamps_required === 0 ? 1 : 0)

    const { data, error } = await this.supabase
      .from('loyalty_cards')
      .update({ total_stamps: newStamps, rewards_earned: newRewards })
      .eq('id', existing.data.id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as LoyaltyCard, error: null, success: true }
  }
}
