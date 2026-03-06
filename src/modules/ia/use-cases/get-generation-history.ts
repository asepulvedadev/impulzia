'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import type { ServiceResult, AiGeneration, AiGenerationFilters } from '../interfaces'

export async function getGenerationHistory(
  businessId: string,
  filters: AiGenerationFilters = {},
): Promise<ServiceResult<AiGeneration[]>> {
  const supabase = await createServerClient()
  const service = new AiGenerationService(supabase)
  return service.getByBusiness(businessId, filters)
}
