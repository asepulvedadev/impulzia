import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { AiUsage, ServiceResult } from '../interfaces'
import type { AiTool } from '../validations/ai.schema'
import type { SubscriptionTier } from '@/lib/ai/config'
import { AI_USAGE_LIMITS, getMonthKey, isUnlimited } from '@/lib/ai/config'

type DB = Database

interface LimitCheckResult {
  canGenerate: boolean
  usageCount: number
  limit: number
  remaining: number
  isUnlimited: boolean
}

export class AiUsageService {
  constructor(private readonly supabase: SupabaseClient<DB>) {}

  async getUsage(
    businessId: string,
    month: string,
    tool: AiTool,
  ): Promise<ServiceResult<AiUsage | null>> {
    const { data, error } = await this.supabase
      .from('ai_usage')
      .select('*')
      .eq('business_id', businessId)
      .eq('month', month)
      .eq('tool', tool)
      .maybeSingle()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiUsage | null, error: null, success: true }
  }

  async incrementUsage(
    businessId: string,
    ownerId: string,
    month: string,
    tool: AiTool,
  ): Promise<ServiceResult<AiUsage>> {
    // Upsert: insert with count=1 or update existing count
    const { data, error } = await this.supabase
      .from('ai_usage')
      .insert({
        business_id: businessId,
        owner_id: ownerId,
        month,
        tool,
        usage_count: 1,
      })
      .select()
      .single()

    if (error) {
      // If unique constraint violated (already exists), increment
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        const { data: updated, error: updateError } = await this.supabase
          .from('ai_usage')
          .update({ usage_count: (await this._getCurrentCount(businessId, month, tool)) + 1 })
          .eq('business_id', businessId)
          .eq('month', month)
          .eq('tool', tool)
          .select()
          .single()

        if (updateError) return { data: null, error: updateError.message, success: false }
        return { data: updated as AiUsage, error: null, success: true }
      }
      return { data: null, error: error.message, success: false }
    }

    return { data: data as AiUsage, error: null, success: true }
  }

  private async _getCurrentCount(businessId: string, month: string, tool: AiTool): Promise<number> {
    const { data } = await this.supabase
      .from('ai_usage')
      .select('usage_count')
      .eq('business_id', businessId)
      .eq('month', month)
      .eq('tool', tool)
      .maybeSingle()

    return (data as AiUsage | null)?.usage_count ?? 0
  }

  async checkLimit(
    businessId: string,
    tool: AiTool,
    tier: SubscriptionTier,
  ): Promise<LimitCheckResult> {
    const month = getMonthKey()
    const limit = AI_USAGE_LIMITS[tier][tool]
    const unlimited = isUnlimited(limit)

    if (unlimited) {
      return { canGenerate: true, usageCount: 0, limit: -1, remaining: -1, isUnlimited: true }
    }

    const { data } = await this.supabase
      .from('ai_usage')
      .select('usage_count')
      .eq('business_id', businessId)
      .eq('month', month)
      .eq('tool', tool)
      .maybeSingle()

    const usageCount = (data as AiUsage | null)?.usage_count ?? 0
    const remaining = Math.max(0, limit - usageCount)

    return {
      canGenerate: usageCount < limit,
      usageCount,
      limit,
      remaining,
      isUnlimited: false,
    }
  }

  async getAllUsageForMonth(
    businessId: string,
    month = getMonthKey(),
  ): Promise<ServiceResult<AiUsage[]>> {
    const { data, error } = await this.supabase
      .from('ai_usage')
      .select('*')
      .eq('business_id', businessId)
      .eq('month', month)

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as AiUsage[], error: null, success: true }
  }
}
