'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiUsageService } from '../services/ai-usage.service'
import { AI_USAGE_LIMITS, getMonthKey, isUnlimited } from '@/lib/ai/config'
import type { AiTool } from '../validations/ai.schema'
import type { SubscriptionTier } from '@/lib/ai/config'
import type { ServiceResult, UsageSummary } from '../interfaces'

export async function getUsageSummary(
  businessId: string,
  tier: SubscriptionTier,
): Promise<ServiceResult<UsageSummary[]>> {
  const supabase = await createServerClient()
  const usageService = new AiUsageService(supabase)
  const month = getMonthKey()

  const tools: AiTool[] = [
    'post_generator',
    'photo_enhancer',
    'promo_ideas',
    'description_generator',
    'review_responder',
    'price_assistant',
  ]

  const { data: usageRecords } = await usageService.getAllUsageForMonth(businessId, month)

  const summaries: UsageSummary[] = tools.map((tool) => {
    const record = (usageRecords ?? []).find((u) => u.tool === tool)
    const usageCount = record?.usage_count ?? 0
    const limit = AI_USAGE_LIMITS[tier][tool]
    const unlimited = isUnlimited(limit)

    return {
      tool,
      month,
      usageCount,
      limit,
      remaining: unlimited ? -1 : Math.max(0, limit - usageCount),
      isUnlimited: unlimited,
    }
  })

  return { data: summaries, error: null, success: true }
}
