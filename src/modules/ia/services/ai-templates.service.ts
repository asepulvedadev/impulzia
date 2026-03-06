import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { AiTemplate, ServiceResult } from '../interfaces'
import type { AiTool } from '../validations/ai.schema'

type DB = Database

export class AiTemplatesService {
  constructor(private readonly supabase: SupabaseClient<DB>) {}

  /**
   * Returns templates for a tool, including global (null category)
   * and category-specific ones, sorted by sort_order.
   */
  async getByTool(tool: AiTool, categorySlug?: string): Promise<ServiceResult<AiTemplate[]>> {
    let query = this.supabase
      .from('ai_templates')
      .select('*')
      .eq('tool', tool)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (categorySlug) {
      // Get global templates + category-specific ones
      query = query.or(`category_slug.is.null,category_slug.eq.${categorySlug}`)
    } else {
      query = query.is('category_slug', null)
    }

    const { data, error } = await query

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as AiTemplate[], error: null, success: true }
  }

  async getById(id: string): Promise<ServiceResult<AiTemplate>> {
    const { data, error } = await this.supabase
      .from('ai_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data: data as AiTemplate, error: null, success: true }
  }
}
