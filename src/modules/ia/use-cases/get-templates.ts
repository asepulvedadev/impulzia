'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiTemplatesService } from '../services/ai-templates.service'
import type { ServiceResult, AiTemplate } from '../interfaces'
import type { AiTool } from '../validations/ai.schema'

export async function getTemplates(
  tool: AiTool,
  categorySlug?: string,
): Promise<ServiceResult<AiTemplate[]>> {
  const supabase = await createServerClient()
  const service = new AiTemplatesService(supabase)
  return service.getByTool(tool, categorySlug)
}
