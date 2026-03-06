import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { AiGeneration, ServiceResult, AiGenerationFilters } from '../interfaces'
import type { AiTool } from '../validations/ai.schema'

type DB = Database

interface CreateInput {
  businessId: string
  ownerId: string
  tool: AiTool
  inputData: Record<string, unknown>
  inputImageUrl?: string
}

interface UpdateOutputInput {
  outputText?: string
  outputImageUrl?: string
  outputData?: Record<string, unknown>
  model: string
  tokensUsed: number
  durationMs: number
}

export class AiGenerationService {
  constructor(private readonly supabase: SupabaseClient<DB>) {}

  async create(input: CreateInput): Promise<ServiceResult<AiGeneration>> {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .insert({
        business_id: input.businessId,
        owner_id: input.ownerId,
        tool: input.tool,
        status: 'pending',
        input_data: input.inputData,
        input_image_url: input.inputImageUrl ?? null,
      })
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiGeneration, error: null, success: true }
  }

  async updateOutput(id: string, output: UpdateOutputInput): Promise<ServiceResult<AiGeneration>> {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({
        status: 'completed',
        output_text: output.outputText ?? null,
        output_image_url: output.outputImageUrl ?? null,
        output_data: output.outputData ?? null,
        model_used: output.model,
        tokens_used: output.tokensUsed,
        processing_time_ms: output.durationMs,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiGeneration, error: null, success: true }
  }

  async markFailed(id: string): Promise<ServiceResult<void>> {
    const { error } = await this.supabase
      .from('ai_generations')
      .update({ status: 'failed' })
      .eq('id', id)

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  }

  async getByBusiness(
    businessId: string,
    filters: AiGenerationFilters = {},
  ): Promise<ServiceResult<AiGeneration[]>> {
    let query = this.supabase
      .from('ai_generations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 20)

    if (filters.tool) query = query.eq('tool', filters.tool)
    if (filters.onlyFavorites) query = query.eq('is_favorite', true)
    if (filters.offset) {
      const limit = filters.limit ?? 20
      query = query.range(filters.offset, filters.offset + limit - 1)
    }

    const { data, error } = await query

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as AiGeneration[], error: null, success: true }
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<ServiceResult<AiGeneration>> {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiGeneration, error: null, success: true }
  }

  async markAsUsed(id: string): Promise<ServiceResult<AiGeneration>> {
    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({ is_used: true })
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiGeneration, error: null, success: true }
  }

  async rateGeneration(id: string, rating: number): Promise<ServiceResult<AiGeneration>> {
    if (rating < 1 || rating > 5) {
      return { data: null, error: 'La calificación debe estar entre 1 y 5', success: false }
    }

    const { data, error } = await this.supabase
      .from('ai_generations')
      .update({ rating })
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiGeneration, error: null, success: true }
  }

  async delete(id: string): Promise<ServiceResult<void>> {
    const { error } = await this.supabase.from('ai_generations').delete().eq('id', id)

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  }
}
