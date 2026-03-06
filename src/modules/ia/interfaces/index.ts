import type { Database } from '@/lib/supabase/database.types'
import type { AiTool } from '../validations/ai.schema'

export type AiGeneration = Database['public']['Tables']['ai_generations']['Row']
export type AiUsage = Database['public']['Tables']['ai_usage']['Row']
export type AiTemplate = Database['public']['Tables']['ai_templates']['Row']

export interface ServiceResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface GenerateResult {
  generationId: string
  outputText: string
  model: string
  tokensUsed: number
  durationMs: number
}

export interface UsageSummary {
  tool: AiTool
  month: string
  usageCount: number
  limit: number
  remaining: number
  isUnlimited: boolean
}

export interface AiGenerationFilters {
  tool?: AiTool
  onlyFavorites?: boolean
  limit?: number
  offset?: number
}
