'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import type { ServiceResult, AiGeneration } from '../interfaces'

export async function rateGeneration(
  generationId: string,
  rating: number,
): Promise<ServiceResult<AiGeneration>> {
  const supabase = await createServerClient()
  const service = new AiGenerationService(supabase)
  return service.rateGeneration(generationId, rating)
}
